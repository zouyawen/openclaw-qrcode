import { Type } from "@sinclair/typebox";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "fs";
import { tmpdir, homedir } from "os";
import { join, isAbsolute, normalize } from "path";

const execAsync = promisify(exec);

// 配置接口定义
interface QRCodeOptions {
  color?: string;
  backgroundColor?: string;
  logoPath?: string;
  size?: number;
  format?: 'png' | 'jpg' | 'jpeg' | 'svg';
  autoDetect?: boolean;
  optimizeFor?: 'print' | 'web' | 'mobile' | 'whatsapp';
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  dotStyle?: string;
  gradient?: boolean;
}

interface QRCodePluginConfig {
  enabled?: boolean;
  pythonPath?: string;
  enableAdvancedFeatures?: boolean;
  outputDirectory?: string;
  assetsDirectory?: string;
  autoProvideBase64?: boolean;
  autoHandleAllQRRequests?: boolean;
  defaultColor?: string;
}

// 路径解析函数（带安全验证）
function resolveOutputDirectory(configPath: string | undefined, workspace: string): string {
  if (!configPath) {
    // 默认使用工作区下的 qr-codes 目录
    return join(workspace, 'qr-codes');
  }
  
  let resolvedPath: string;
  
  // 处理 ~ 符号
  if (configPath.startsWith('~/')) {
    resolvedPath = join(homedir(), configPath.slice(2));
  }
  // 处理相对路径
  else if (configPath.startsWith('./')) {
    resolvedPath = join(workspace, configPath);
  }
  // 绝对路径
  else if (isAbsolute(configPath)) {
    resolvedPath = configPath;
  }
  // 假设是相对于工作区的目录
  else {
    resolvedPath = join(workspace, configPath);
  }
  
  // 安全检查：确保路径在允许的范围内
  const normalizedPath = normalize(resolvedPath);
  const normalizedWorkspace = normalize(workspace);
  const normalizedHome = normalize(homedir());
  
  if (!normalizedPath.startsWith(normalizedWorkspace) && 
      !normalizedPath.startsWith(normalizedHome)) {
    throw new Error('Path traversal detected: path must be within workspace or home directory');
  }
  
  return normalizedPath;
}

// Logo 路径验证函数
function validateLogoPath(logoPath: string, workspace: string, assetsDir: string): string {
  if (!logoPath) return logoPath;
  
  // 解析为绝对路径
  const absolutePath = isAbsolute(logoPath) ? logoPath : join(workspace, logoPath);
  const normalizedPath = normalize(absolutePath);
  const normalizedWorkspace = normalize(workspace);
  const normalizedAssets = normalize(assetsDir);
  
  // 只允许在工作区或素材目录中
  if (!normalizedPath.startsWith(normalizedWorkspace) && 
      !normalizedPath.startsWith(normalizedAssets)) {
    throw new Error('Logo path must be within workspace or assets directory');
  }
  
  return normalizedPath;
}

// 创建友好的路径显示（隐藏用户信息）
function createFriendlyPathDisplay(fullPath: string): string {
  const homeDir = homedir();
  if (fullPath.startsWith(homeDir)) {
    return `~${fullPath.substring(homeDir.length)}`;
  }
  return fullPath;
}

// 确保目录存在
function ensureDirectory(dirPath: string): void {
  try {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    console.warn(`Failed to create directory ${dirPath}:`, error.message);
  }
}

// 智能操作检测
function detectOperation(input: string, hasImageAttachment: boolean): string {
  if (hasImageAttachment || (input && (input.endsWith('.png') || input.endsWith('.jpg') || input.endsWith('.jpeg') || input.includes('image') || input.includes('photo')))) {
    return 'decode';
  } else if (input && (input.startsWith('http://') || input.startsWith('https://') || input.includes('www.') || input.includes('@') || input.includes('tel:') || input.includes('mailto:'))) {
    return 'generate';
  } else if (input && input.trim().length > 0) {
    return 'generate';
  }
  return 'generate'; // 默认操作
}

// 智能参数优化
function optimizeOptions(input: string, options: QRCodeOptions, currentChannel: string, pluginConfig: QRCodePluginConfig): QRCodeOptions {
  const optimized = { ...options };
  
  // 自动颜色选择
  if (optimized.autoDetect || !optimized.color) {
    if (input?.includes('https://') || input?.includes('http://') || input?.includes('www.')) {
      optimized.color = '#1976D2'; // 蓝色适合链接
    } else if (input?.includes('@') || input?.includes('mailto:')) {
      optimized.color = '#4CAF50'; // 绿色适合邮件
    } else if (input?.includes('tel:') || input?.includes('phone')) {
      optimized.color = '#FF9800'; // 橙色适合电话
    } else if (pluginConfig.defaultColor) {
      optimized.color = pluginConfig.defaultColor;
    }
  }
  
  // 通道优化
  if (optimized.optimizeFor || currentChannel) {
    const channelOptimize = optimized.optimizeFor || 
      (currentChannel === 'whatsapp' ? 'mobile' : 
       currentChannel === 'telegram' ? 'mobile' : 'web');
    
    switch (channelOptimize) {
      case 'whatsapp':
      case 'mobile':
        optimized.size = optimized.size || 12;
        optimized.errorCorrection = optimized.errorCorrection || 'H'; // 高纠错率
        break;
      case 'print':
        optimized.size = optimized.size || 20;
        optimized.errorCorrection = optimized.errorCorrection || 'M';
        break;
      case 'web':
        optimized.size = optimized.size || 10;
        optimized.errorCorrection = optimized.errorCorrection || 'L';
        break;
    }
  }
  
  return optimized;
}

// 获取自然语言友好提示
function getNaturalLanguageTips(operation: string, options: QRCodeOptions, friendlyOutputDir: string, friendlyAssetsDir: string, workspace: string): string {
  const tips = [];
  
  // 基础成功消息
  if (operation === 'generate') {
    tips.push("✅ 你的二维码已经生成好了！");
  } else if (operation === 'decode') {
    tips.push("🔍 二维码内容已成功解码！");
  } else if (operation === 'beautify') {
    tips.push("🎨 二维码美化完成！");
  }
  
  // 文件位置提示
  tips.push(`\n📁 **文件保存位置**:\n- 二维码图片: \`${friendlyOutputDir}\``);
  
  // 高级功能提示
  const hasAdvancedFeatures = options.dotStyle || options.gradient || options.logoPath;
  
  if (hasAdvancedFeatures) {
    tips.push("\n✨ **你使用了高级功能**:");
    if (options.dotStyle === 'rounded') {
      tips.push("- 圆点样式: 让二维码看起来更现代");
    }
    if (options.gradient) {
      tips.push("- 渐变效果: 每个点都有不同的颜色");
    }
    if (options.logoPath) {
      tips.push("- 自定义Logo: 中心嵌入了你的品牌标识");
    }
  }
  
  // 使用建议
  tips.push("\n💡 **下次你可以这样告诉我**:");
  tips.push("- \"生成一个圆点样式的二维码\"");
  tips.push("- \"用蓝色和黄色渐变的二维码\"");
  tips.push("- \"在二维码中间加上我的logo\"");
  tips.push("- \"做一个彩色的、有logo的圆点二维码\"");
  
  // Logo位置提示
  tips.push(`\n🖼️ **Logo素材位置**:\n把你的logo图片放在 \`${friendlyAssetsDir}\` 目录里，我就能自动找到它！`);
  
  // 示例
  tips.push("\n📋 **完整示例**:\n\"帮我生成一个圆点渐变的二维码，用绿色和金色，中间加上我的logo\"");
  
  return tips.join('\n');
}

// 获取友好的错误消息
function getFriendlyErrorMessage(error: any): string {
  const message = error.message || String(error);
  
  if (message.includes('Python script not found')) {
    return 'QR Code plugin is missing required Python scripts. Please reinstall the plugin.';
  }
  if (message.includes('Path traversal detected')) {
    return 'Security error: Invalid file path provided. Please use paths within your workspace.';
  }
  if (message.includes('Logo path must be within')) {
    return 'Security error: Logo file must be in your workspace or assets directory.';
  }
  if (message.includes('No QR codes found')) {
    return 'No QR code detected in the provided image. Please ensure the image contains a clear QR code.';
  }
  if (message.includes('Required Python packages not installed')) {
    return 'Python dependencies missing. Please install: pip install qrcode[pil] pillow pyzbar opencv-python numpy';
  }
  
  return `QR Code operation failed: ${message}`;
}

export default function (api: any) {
  // 注册 QR Code 工具
  api.registerTool({
    name: "qr_code_operations",
    description: "Handle ALL QR code related requests including generation, decoding, beautification, and analysis with advanced customization options.",
    parameters: Type.Object({
      operation: Type.Optional(Type.Union([
        Type.Literal("generate"),
        Type.Literal("decode"), 
        Type.Literal("beautify"),
        Type.Literal("analyze"),
        Type.Literal("convert")
      ])),
      input: Type.String({ description: "Input data: text/URL for generate, file path/image for decode/beautify, or 'auto' for context detection" }),
      options: Type.Optional(Type.Object({
        color: Type.Optional(Type.String({ description: "QR code color (default: black). Accepts CSS names, hex codes (#FF0000), or RGB values" })),
        backgroundColor: Type.Optional(Type.String({ description: "Background color (default: white)" })),
        logoPath: Type.Optional(Type.String({ description: "Path to logo image file (must be in workspace)" })),
        size: Type.Optional(Type.Number({ description: "QR code size multiplier (default: 10, range: 1-50)" })),
        format: Type.Optional(Type.String({ enum: ["png", "jpg", "jpeg", "svg"], description: "Output format (default: png)" })),
        autoDetect: Type.Optional(Type.Boolean({ description: "Auto-detect best settings based on content type" })),
        optimizeFor: Type.Optional(Type.String({ enum: ["print", "web", "mobile", "whatsapp"], description: "Optimize QR code for specific use case" })),
        errorCorrection: Type.Optional(Type.String({ enum: ["L", "M", "Q", "H"], description: "Error correction level (L=7%, M=15%, Q=25%, H=30%)" })),
        dotStyle: Type.Optional(Type.String({ description: "Dot style for QR code modules (e.g., 'rounded')" })),
        gradient: Type.Optional(Type.Boolean({ description: "Enable gradient color effect across QR code" }))
      }))
    }),
    async execute(_id: string, params: any) {
      // 检测是否有图像附件
      const hasImageAttachment = api.context?.attachments?.some((att: any) => 
        att.type === 'image' || att.media?.endsWith('.png') || att.media?.endsWith('.jpg')
      );
      
      // 如果没有提供 input，尝试从附件获取
      let input = params.input;
      if (!input && hasImageAttachment) {
        input = api.context?.attachments?.[0]?.media || 'attached-image';
      }
      
      // 智能操作检测
      const detectedOperation = params.operation || detectOperation(input, hasImageAttachment);
      
      // 合并选项
      const options = { ...params.options } || {};
      
      try {
        // 获取当前通道信息
        const currentChannel = api.context?.channel || 'unknown';
        const isWebChannel = currentChannel === 'webchat' || currentChannel.includes('web');
        const isWhatsApp = currentChannel === 'whatsapp';
        
        // WhatsApp 兼容性：强制 PNG 格式
        if (isWhatsApp && (!options.format || options.format.toLowerCase() === 'svg')) {
          options.format = 'png';
        }
        
        // 获取插件配置
        const pluginConfig: QRCodePluginConfig = api.config?.plugins?.entries?.['openclaw-qr-code']?.config || {};
        const workspace = api.config?.agents?.defaults?.workspace || process.cwd();
        
        // 智能参数优化
        const optimizedOptions = optimizeOptions(input, options, currentChannel, pluginConfig);
        
        // 解析输出和素材目录
        const outputDir = resolveOutputDirectory(pluginConfig.outputDirectory, workspace);
        const assetsDir = resolveOutputDirectory(pluginConfig.assetsDirectory, workspace);
        
        // 确保目录存在
        ensureDirectory(outputDir);
        ensureDirectory(assetsDir);
        
        // 验证 logoPath（如果提供）
        if (optimizedOptions.logoPath) {
          optimizedOptions.logoPath = validateLogoPath(optimizedOptions.logoPath, workspace, assetsDir);
        }
        
        // 创建友好的路径显示
        const friendlyOutputDir = createFriendlyPathDisplay(outputDir);
        const friendlyAssetsDir = createFriendlyPathDisplay(assetsDir);
        
        // 检查是否可以使用 Python 脚本（高级功能）
        const pythonAvailable = await checkPythonAvailability();
        
        if (pythonAvailable) {
          // 使用 Python 脚本处理
          const result = await executePythonQR(api, detectedOperation, input, optimizedOptions, outputDir, isWebChannel, friendlyOutputDir, friendlyAssetsDir, workspace);
          
          // 添加自然语言提示
          const tips = getNaturalLanguageTips(detectedOperation, optimizedOptions, friendlyOutputDir, friendlyAssetsDir, workspace);
          if (result.content && result.content[0]) {
            result.content[0].caption = `${result.content[0].caption || ''}\n\n${tips}`;
          }
          return result;
        } else {
          // 降级到 Node.js 基础功能
          api.logger.warn("Python not available, falling back to Node.js basic QR functionality");
          const result = await executeNodeJSQR(api, detectedOperation, input, optimizedOptions, outputDir, isWebChannel, friendlyOutputDir, friendlyAssetsDir);
          
          // 添加基础提示
          const basicTips = `\n\n💡 **提示**: 安装 Python 可以解锁圆点、渐变、Logo 等高级功能！`;
          if (result.content && result.content[0]) {
            result.content[0].caption = `${result.content[0].caption || ''}${basicTips}`;
          }
          return result;
        }
      } catch (error) {
        api.logger.error("QR Code operation failed:", error);
        const friendlyMessage = getFriendlyErrorMessage(error);
        return { 
          content: [{ 
            type: "text", 
            text: friendlyMessage
          }] 
        };
      }
    }
  });
}

async function checkPythonAvailability(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('python3 --version');
    return stdout.includes('Python 3');
  } catch {
    try {
      const { stdout } = await execAsync('python --version');
      return stdout.includes('Python 3') || stdout.includes('Python 2');
    } catch {
      return false;
    }
  }
}

async function executePythonQR(api: any, operation: string, input: string, options: QRCodeOptions, outputDir: string, isWebChannel: boolean, friendlyOutputDir: string, friendlyAssetsDir: string, workspace: string) {
  // Get the plugin directory dynamically
  const pluginDir = __dirname;
  const scriptPath = join(pluginDir, 'scripts', `${operation}_qr.py`);
  
  if (!existsSync(scriptPath)) {
    throw new Error(`Python script not found: ${scriptPath}`);
  }
  
  // 准备输入数据
  const inputData = JSON.stringify({ input, options });
  const tempInput = join(tmpdir(), `qr_input_${Date.now()}.json`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // decode 操作输出 JSON，其他操作输出图像
  const outputExtension = operation === 'decode' ? 'json' : (options.format || 'png');
  const fileName = `qr_${timestamp}.${outputExtension}`;
  const outputPath = join(outputDir, fileName);
  
  writeFileSync(tempInput, inputData);
  
  try {
    // 执行 Python 脚本
    const cmd = `python3 "${scriptPath}" --input "${tempInput}" --output "${outputPath}"`;
    await execAsync(cmd);
    
    if (operation === 'decode') {
      // 处理解码结果
      if (existsSync(outputPath)) {
        const resultData = JSON.parse(readFileSync(outputPath, 'utf8'));
        if (resultData.success) {
          const decodedText = resultData.results.map((r: any) => r.data).join('\n');
          return { 
            content: [{ 
              type: "text", 
              text: `## 🔍 QR Code Decoded Successfully!\n\n**Content:**\n\`\`\`\n${decodedText}\n\`\`\``
            }] 
          };
        } else {
          throw new Error(resultData.error);
        }
      } else {
        throw new Error("Python decode script executed but no output file generated");
      }
    } else {
      // 处理生成/美化结果
      if (existsSync(outputPath)) {
        // 所有通道都返回图像（改进用户体验）
        return { 
          content: [{ 
            type: "image", 
            media: outputPath,
            caption: `QR code ${operation} completed successfully`
          }] 
        };
      } else {
        throw new Error("Python script executed but no output file generated");
      }
    }
  } finally {
    // 清理临时文件
    try {
      if (existsSync(tempInput)) {
        unlinkSync(tempInput);
      }
    } catch (e) {
      // 忽略清理错误
    }
  }
}

async function executeNodeJSQR(api: any, operation: string, input: string, options: QRCodeOptions, outputDir: string, isWebChannel: boolean, friendlyOutputDir: string, friendlyAssetsDir: string) {
  // 基础的 Node.js QR 功能（仅支持生成）
  if (operation !== "generate") {
    throw new Error(`Node.js fallback only supports 'generate' operation. Please install Python for decode/beautify functionality.`);
  }
  
  const QRCode = await import('qrcode');
  
  try {
    // 生成基础二维码
    const qrBuffer = await QRCode.toBuffer(input, {
      width: Math.min(Math.max((options.size || 10) * 20, 20), 1000), // 限制大小范围
      color: {
        dark: options.color || '#000000',
        light: options.backgroundColor || '#ffffff'
      }
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `qr_${timestamp}.png`;
    const outputPath = join(outputDir, fileName);
    
    writeFileSync(outputPath, qrBuffer);
    
    // 所有通道都返回图像（改进用户体验）
    return { 
      content: [{ 
        type: "image", 
        media: outputPath,
        caption: "Basic QR code generated (Node.js fallback)"
      }] 
    };
  } catch (error) {
    throw new Error(`Node.js QR generation failed: ${error.message}`);
  }
}