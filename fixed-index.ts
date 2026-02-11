import { Type } from "@sinclair/typebox";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "fs";
import { tmpdir, homedir } from "os";
import { join, isAbsolute, normalize } from "path";

const execAsync = promisify(exec);

// 类型定义
interface QRCodeOptions {
  color?: string;
  backgroundColor?: string;
  logoPath?: string;
  size?: number;
  format?: 'png' | 'jpg' | 'jpeg' | 'svg';
}

interface QRCodePluginConfig {
  enabled?: boolean;
  pythonPath?: string;
  enableAdvancedFeatures?: boolean;
  outputDirectory?: string;
  assetsDirectory?: string;
  autoProvideBase64?: boolean;
}

// 路径解析函数 - 修复安全漏洞
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
  const normalizedHomeDir = normalize(homedir());
  
  if (!normalizedPath.startsWith(normalizedWorkspace) && 
      !normalizedPath.startsWith(normalizedHomeDir)) {
    throw new Error('Security error: Path must be within workspace or home directory');
  }
  
  return normalizedPath;
}

// Logo 路径验证 - 新增安全验证
function validateLogoPath(logoPath: string | undefined, workspace: string, assetsDir: string): string | undefined {
  if (!logoPath) return undefined;
  
  // 解析为绝对路径
  const absolutePath = isAbsolute(logoPath) ? logoPath : join(workspace, logoPath);
  const normalizedPath = normalize(absolutePath);
  const normalizedWorkspace = normalize(workspace);
  const normalizedAssetsDir = normalize(assetsDir);
  
  // 只允许在工作区或素材目录中
  if (!normalizedPath.startsWith(normalizedWorkspace) && 
      !normalizedPath.startsWith(normalizedAssetsDir)) {
    throw new Error('Security error: Logo path must be within workspace or assets directory');
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

// 获取友好的错误消息
function getFriendlyErrorMessage(error: any): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('python') || message.includes('script not found')) {
    return "QR Code operation requires Python with required packages. Please install: `pip install qrcode[pil] pillow pyzbar opencv-python numpy`";
  }
  if (message.includes('security') || message.includes('path')) {
    return "Security error: Invalid file path. Please use paths within your workspace directory.";
  }
  if (message.includes('logo') || message.includes('file not found')) {
    return "Logo file not found. Please ensure the logo file exists in your workspace.";
  }
  if (message.includes('decode') || message.includes('no qr codes')) {
    return "No QR codes found in the provided image. Please ensure the image contains a valid QR code.";
  }
  
  return `QR Code operation failed: ${error.message}. Please check your input and try again.`;
}

export default function (api) {
  // 注册 QR Code 工具
  api.registerTool({
    name: "qr_code_operations",
    description: "Generate, decode, and beautify QR codes with various customization options. Supports both Python-based advanced features and Node.js fallback for basic operations.",
    parameters: Type.Object({
      operation: Type.Union([
        Type.Literal("generate"),
        Type.Literal("decode"),
        Type.Literal("beautify")
      ]),
      input: Type.String({ description: "Input data: text/URL for generate, file path for decode/beautify" }),
      options: Type.Optional(Type.Object({
        color: Type.Optional(Type.String({ description: "QR code color (default: black)" })),
        backgroundColor: Type.Optional(Type.String({ description: "Background color (default: white)" })),
        logoPath: Type.Optional(Type.String({ description: "Path to logo image file (must be within workspace)" })),
        size: Type.Optional(Type.Number({ minimum: 1, maximum: 50, description: "QR code size multiplier (1-50, default: 10)" })),
        format: Type.Optional(Type.String({ enum: ["png", "jpg", "jpeg", "svg"], description: "Output format (default: png)" }))
      }))
    }),
    async execute(_id, params) {
      const { operation, input, options = {} } = params;
      
      try {
        // 获取当前通道信息
        const currentChannel = api.context?.channel || 'unknown';
        const isWebChannel = currentChannel === 'webchat' || currentChannel.includes('web');
        const isWhatsApp = currentChannel === 'whatsapp';
        
        // WhatsApp 兼容性：自动转换 SVG 到 PNG
        if (isWhatsApp && options.format === 'svg') {
          options.format = 'png';
        }
        
        // 获取插件配置
        const pluginConfig = api.config?.plugins?.entries?.['qr-code']?.config || {};
        const workspace = api.config?.agents?.defaults?.workspace || process.cwd();
        
        // 解析输出和素材目录
        const outputDir = resolveOutputDirectory(pluginConfig.outputDirectory, workspace);
        const assetsDir = resolveOutputDirectory(pluginConfig.assetsDirectory, workspace);
        
        // 验证 logoPath 安全性
        if (options.logoPath) {
          options.logoPath = validateLogoPath(options.logoPath, workspace, assetsDir);
        }
        
        // 确保目录存在
        ensureDirectory(outputDir);
        ensureDirectory(assetsDir);
        
        // 创建友好的路径显示
        const friendlyOutputDir = createFriendlyPathDisplay(outputDir);
        const friendlyAssetsDir = createFriendlyPathDisplay(assetsDir);
        
        // 检查是否可以使用 Python 脚本（高级功能）
        const pythonAvailable = await checkPythonAvailability();
        
        if (pythonAvailable) {
          // 使用 Python 脚本处理
          const result = await executePythonQR(api, operation, input, options, outputDir, isWebChannel, friendlyOutputDir, friendlyAssetsDir, isWhatsApp);
          return result;
        } else {
          // 降级到 Node.js 基础功能
          api.logger.warn("Python not available, falling back to Node.js basic QR functionality");
          const result = await executeNodeJSQR(api, operation, input, options, outputDir, isWebChannel, friendlyOutputDir, friendlyAssetsDir, isWhatsApp);
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

async function executePythonQR(api: any, operation: string, input: string, options: QRCodeOptions, outputDir: string, isWebChannel: boolean, friendlyOutputDir: string, friendlyAssetsDir: string, isWhatsApp: boolean) {
  // Get the plugin directory dynamically
  const pluginDir = __dirname;
  const scriptPath = join(pluginDir, 'scripts', 'qr-code', `${operation}_qr.py`);
  
  if (!existsSync(scriptPath)) {
    throw new Error(`Python script not found: ${scriptPath}`);
  }
  
  // 准备输入数据
  const inputData = JSON.stringify({ input, options });
  const tempInput = join(tmpdir(), `qr_input_${Date.now()}.json`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // 根据操作类型确定输出文件扩展名
  let outputFileExtension = 'png';
  if (operation === 'decode') {
    outputFileExtension = 'json'; // decode 输出 JSON
  } else {
    outputFileExtension = options.format || 'png';
  }
  
  const fileName = `qr_${timestamp}.${outputFileExtension}`;
  const outputPath = join(outputDir, fileName);
  
  writeFileSync(tempInput, inputData);
  
  try {
    // 执行 Python 脚本
    const cmd = `python3 "${scriptPath}" --input "${tempInput}" --output "${outputPath}"`;
    await execAsync(cmd);
    
    if (operation === 'decode') {
      // 特殊处理 decode 操作
      if (existsSync(outputPath)) {
        const resultData = JSON.parse(readFileSync(outputPath, 'utf8'));
        if (resultData.success) {
          let decodeResult = `## 🔍 QR Code Decoded Successfully!\n\n`;
          resultData.results.forEach((result: any, index: number) => {
            decodeResult += `**Result ${index + 1}:** ${result.data}\n`;
          });
          
          if (isWebChannel) {
            decodeResult += `\n### 📁 File Location\n- **Saved to**: \`${friendlyOutputDir}\`\n- **Copy Path**: \`${friendlyOutputDir}/${fileName}\``;
          }
          
          return { 
            content: [{ 
              type: "text", 
              text: decodeResult
            }] 
          };
        } else {
          throw new Error(resultData.error || 'Failed to decode QR code');
        }
      } else {
        throw new Error("Decode script executed but no output file generated");
      }
    } else {
      // generate 和 beautify 操作
      if (existsSync(outputPath)) {
        if (isWebChannel) {
          // Web 通道：返回友好消息 + 文件路径
          let responseText = `## 📱 QR Code Generated Successfully!

### 🔗 Content
- **Content**: ${input}

### 📁 File Location
- **Saved to**: \`${friendlyOutputDir}\`

### 🎨 Quick Actions
- **Open Directory**: \`open "${outputDir}"\`
- **Copy Path**: \`${friendlyOutputDir}/${fileName}\``;

          // 如果有 logoPath 选项，提供素材目录提示
          if (options.logoPath) {
            responseText += `\n\n### 🖼️ Logo Assets
- **Your logo**: \`${options.logoPath}\`
- **Assets directory**: \`${friendlyAssetsDir}\``;
          }

          responseText += `\n\n### ❓ Need Base64?
Reply with "base64" or "yes" to get the Base64 encoded version for web embedding.`;

          return { 
            content: [{ 
              type: "text", 
              text: responseText
            }] 
          };
        } else {
          // 其他通道：直接显示图片
          return { 
            content: [{ 
              type: "image", 
              media: outputPath,
              caption: `QR code ${operation} completed successfully`
            }] 
          };
        }
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

async function executeNodeJSQR(api: any, operation: string, input: string, options: QRCodeOptions, outputDir: string, isWebChannel: boolean, friendlyOutputDir: string, friendlyAssetsDir: string, isWhatsApp: boolean) {
  // 基础的 Node.js QR 功能（仅支持生成）
  if (operation !== "generate") {
    throw new Error(`Node.js fallback only supports 'generate' operation. Please install Python for decode/beautify functionality.`);
  }
  
  const QRCode = await import('qrcode');
  
  try {
    // 生成基础二维码
    const qrBuffer = await QRCode.toBuffer(input, {
      width: (options.size || 10) * 20,
      color: {
        dark: options.color || '#000000',
        light: options.backgroundColor || '#ffffff'
      }
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `qr_${timestamp}.png`;
    const outputPath = join(outputDir, fileName);
    
    writeFileSync(outputPath, qrBuffer);
    
    if (isWebChannel) {
      // Web 通道：返回友好消息
      let responseText = `## 📱 QR Code Generated Successfully!

### 🔗 Content  
- **Content**: ${input}

### 📁 File Location
- **Saved to**: \`${friendlyOutputDir}\`

### 🎨 Quick Actions
- **Open Directory**: \`open "${outputDir}"\`
- **Copy Path**: \`${friendlyOutputDir}/${fileName}\``;

      // 如果有 logoPath 选项，提供素材目录提示
      if (options.logoPath) {
        responseText += `\n\n### 🖼️ Logo Assets
- **Your logo**: \`${options.logoPath}\`
- **Assets directory**: \`${friendlyAssetsDir}\``;
      }

      responseText += `\n\n### ❓ Need Base64?
Reply with "base64" or "yes" to get the Base64 encoded version for web embedding.`;

      return { 
        content: [{ 
          type: "text", 
          text: responseText
        }] 
      };
    } else {
      // 其他通道：直接显示图片
      return { 
        content: [{ 
          type: "image", 
          media: outputPath,
          caption: "Basic QR code generated (Node.js fallback)"
        }] 
      };
    }
  } catch (error) {
    throw new Error(`Node.js QR generation failed: ${error.message}`);
  }
}