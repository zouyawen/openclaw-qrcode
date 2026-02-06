import { Type } from "@sinclair/typebox";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir, homedir } from "os";
import { join, isAbsolute } from "path";

const execAsync = promisify(exec);

// 路径解析函数
function resolveOutputDirectory(configPath: string | undefined, workspace: string): string {
  if (!configPath) {
    // 默认使用工作区下的 qr-codes 目录
    return join(workspace, 'qr-codes');
  }
  
  // 处理 ~ 符号
  if (configPath.startsWith('~/')) {
    return join(homedir(), configPath.slice(2));
  }
  
  // 处理相对路径
  if (configPath.startsWith('./') || configPath.startsWith('../')) {
    return join(workspace, configPath);
  }
  
  // 绝对路径
  if (isAbsolute(configPath)) {
    return configPath;
  }
  
  // 假设是相对于工作区的目录
  return join(workspace, configPath);
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
        logoPath: Type.Optional(Type.String({ description: "Path to logo image file" })),
        size: Type.Optional(Type.Number({ description: "QR code size multiplier (default: 10)" })),
        format: Type.Optional(Type.String({ enum: ["png", "jpg", "svg"], description: "Output format (default: png)" }))
      }))
    }),
    async execute(_id, params) {
      const { operation, input, options = {} } = params;
      
      try {
        // 获取当前通道信息
        const currentChannel = api.context?.channel || 'unknown';
        const isWebChannel = currentChannel === 'webchat' || currentChannel.includes('web');
        
        // 获取插件配置
        const pluginConfig = api.config?.plugins?.entries?.['qr-code']?.config || {};
        const workspace = api.config?.agents?.defaults?.workspace || process.cwd();
        
        // 解析输出和素材目录
        const outputDir = resolveOutputDirectory(pluginConfig.outputDirectory, workspace);
        const assetsDir = resolveOutputDirectory(pluginConfig.assetsDirectory, workspace);
        
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
          const result = await executePythonQR(api, operation, input, options, outputDir, isWebChannel, friendlyOutputDir, friendlyAssetsDir);
          return result;
        } else {
          // 降级到 Node.js 基础功能
          api.logger.warn("Python not available, falling back to Node.js basic QR functionality");
          const result = await executeNodeJSQR(api, operation, input, options, outputDir, isWebChannel, friendlyOutputDir, friendlyAssetsDir);
          return result;
        }
      } catch (error) {
        api.logger.error("QR Code operation failed:", error);
        return { 
          content: [{ 
            type: "text", 
            text: `QR Code operation failed: ${error.message}` 
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

async function executePythonQR(api: any, operation: string, input: string, options: any, outputDir: string, isWebChannel: boolean, friendlyOutputDir: string, friendlyAssetsDir: string) {
  // Get the plugin directory dynamically
  const pluginDir = __dirname;
  const skillPath = join(pluginDir, 'skills', 'qr-code');
  const scriptPath = `${skillPath}/scripts/${operation}_qr.py`;
  
  if (!existsSync(scriptPath)) {
    throw new Error(`Python script not found: ${scriptPath}`);
  }
  
  // 准备输入数据
  const inputData = JSON.stringify({ input, options });
  const tempInput = join(tmpdir(), `qr_input_${Date.now()}.json`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `qr_${timestamp}.${options.format || 'png'}`;
  const outputPath = join(outputDir, fileName);
  
  writeFileSync(tempInput, inputData);
  
  try {
    // 执行 Python 脚本
    const cmd = `python3 "${scriptPath}" --input "${tempInput}" --output "${outputPath}"`;
    await execAsync(cmd);
    
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
  } finally {
    // 清理临时文件
    try {
      // 这里可以添加清理逻辑，但为了调试暂时保留
    } catch (e) {
      // 忽略清理错误
    }
  }
}

async function executeNodeJSQR(api: any, operation: string, input: string, options: any, outputDir: string, isWebChannel: boolean, friendlyOutputDir: string, friendlyAssetsDir: string) {
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