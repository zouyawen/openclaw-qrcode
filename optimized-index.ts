import { Type } from "@sinclair/typebox";
import { exec } from "child_process";
import { promisify } from "util";
import { 
  existsSync, 
  readFileSync, 
  writeFileSync, 
  mkdirSync, 
  accessSync, 
  constants 
} from "fs";
import { tmpdir, homedir } from "os";
import { join, isAbsolute, resolve, dirname } from "path";

const execAsync = promisify(exec);

// 配置接口
interface QRCodePluginConfig {
  enabled?: boolean;
  pythonPath?: string;
  enableAdvancedFeatures?: boolean;
  outputDirectory?: string;
  assetsDirectory?: string;
  autoProvideBase64?: boolean;
}

// 安全路径验证
function isValidPath(path: string): boolean {
  // 禁止路径遍历
  if (path.includes('..') || path.includes('~')) {
    return false;
  }
  // 禁止绝对路径（除非明确允许）
  if (isAbsolute(path) && !path.startsWith('/tmp') && !path.startsWith(homedir())) {
    return false;
  }
  return true;
}

// 安全路径解析
function resolveSafePath(inputPath: string | undefined, workspace: string, defaultSubdir: string): string {
  if (!inputPath) {
    return join(workspace, defaultSubdir);
  }

  // 处理 ~ 符号
  let resolvedPath = inputPath;
  if (inputPath.startsWith('~/')) {
    resolvedPath = join(homedir(), inputPath.slice(2));
  }
  // 处理相对路径
  else if (inputPath.startsWith('./') || inputPath.startsWith('../')) {
    resolvedPath = join(workspace, inputPath);
  }
  // 绝对路径保持不变
  else if (!isAbsolute(inputPath)) {
    resolvedPath = join(workspace, inputPath);
  }

  // 确保路径在安全范围内
  const normalizedPath = resolve(resolvedPath);
  if (!normalizedPath.startsWith(workspace) && 
      !normalizedPath.startsWith(homedir()) && 
      !normalizedPath.startsWith('/tmp')) {
    throw new Error('Path outside of allowed directories');
  }

  return normalizedPath;
}

// 创建友好的路径显示
function createFriendlyPathDisplay(fullPath: string): string {
  const homeDir = homedir();
  if (fullPath.startsWith(homeDir)) {
    return `~${fullPath.substring(homeDir.length)}`;
  }
  return fullPath;
}

// 确保目录存在且可写
function ensureWritableDirectory(dirPath: string): void {
  try {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    // 检查写权限
    accessSync(dirPath, constants.W_OK);
  } catch (error) {
    throw new Error(`Cannot access directory ${dirPath}: ${error.message}`);
  }
}

export default function (api: any) {
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
      input: Type.String({ 
        description: "Input data: text/URL for generate, file path for decode/beautify" 
      }),
      options: Type.Optional(Type.Object({
        color: Type.Optional(Type.String({ 
          description: "QR code color (default: black). Accepts CSS color names or hex codes." 
        })),
        backgroundColor: Type.Optional(Type.String({ 
          description: "Background color (default: white). Accepts CSS color names or hex codes." 
        })),
        logoPath: Type.Optional(Type.String({ 
          description: "Path to logo image file (PNG, JPG, GIF). Must be within workspace or home directory." 
        })),
        size: Type.Optional(Type.Number({ 
          description: "QR code size multiplier (default: 10). Range: 1-50.", 
          minimum: 1,
          maximum: 50
        })),
        format: Type.Optional(Type.String({ 
          enum: ["png", "jpg", "svg"], 
          description: "Output format (default: png)" 
        }))
      }))
    }),
    async execute(_id: string, params: any) {
      const { operation, input, options = {} } = params;
      
      try {
        // 获取上下文信息
        const currentChannel = api.context?.channel || 'unknown';
        const isWebChannel = currentChannel === 'webchat';
        const workspace = api.config?.agents?.defaults?.workspace || process.cwd();
        
        // 获取插件配置
        const pluginConfig: QRCodePluginConfig = api.config?.plugins?.entries?.['qr-code']?.config || {};
        
        // 解析并验证输出目录
        const outputDir = resolveSafePath(pluginConfig.outputDirectory, workspace, 'qr-codes');
        const assetsDir = resolveSafePath(pluginConfig.assetsDirectory, workspace, 'qr-assets');
        
        // 确保目录可写
        ensureWritableDirectory(outputDir);
        ensureWritableDirectory(assetsDir);
        
        // 创建友好路径显示
        const friendlyOutputDir = createFriendlyPathDisplay(outputDir);
        const friendlyAssetsDir = createFriendlyPathDisplay(assetsDir);
        
        // 验证 logoPath（如果提供）
        if (options.logoPath) {
          const logoPath = resolveSafePath(options.logoPath, workspace, '');
          if (!existsSync(logoPath)) {
            throw new Error(`Logo file not found: ${options.logoPath}`);
          }
          options.logoPath = logoPath; // 使用完整路径
        }
        
        // 检查 Python 可用性
        const pythonAvailable = await checkPythonAvailability(pluginConfig.pythonPath);
        
        if (pythonAvailable && pluginConfig.enableAdvancedFeatures !== false) {
          // 使用 Python 脚本处理
          const result = await executePythonQR(
            api, operation, input, options, outputDir, 
            isWebChannel, friendlyOutputDir, friendlyAssetsDir
          );
          return result;
        } else {
          // 降级到 Node.js 基础功能
          api.logger.warn("Python not available or disabled, falling back to Node.js basic QR functionality");
          const result = await executeNodeJSQR(
            api, operation, input, options, outputDir, 
            isWebChannel, friendlyOutputDir, friendlyAssetsDir
          );
          return result;
        }
      } catch (error: any) {
        api.logger.error("QR Code operation failed:", error);
        return { 
          content: [{ 
            type: "text", 
            text: `❌ QR Code operation failed: ${error.message}` 
          }] 
        };
      }
    }
  });
}

async function checkPythonAvailability(pythonPath?: string): Promise<boolean> {
  const pythonCmd = pythonPath || 'python3';
  
  try {
    const { stdout } = await execAsync(`${pythonCmd} --version`);
    return stdout.includes('Python 3') || stdout.includes('Python 2');
  } catch {
    // 尝试备用命令
    try {
      const { stdout } = await execAsync('python --version');
      return stdout.includes('Python 3') || stdout.includes('Python 2');
    } catch {
      return false;
    }
  }
}

async function executePythonQR(
  api: any, 
  operation: string, 
  input: string, 
  options: any, 
  outputDir: string, 
  isWebChannel: boolean, 
  friendlyOutputDir: string, 
  friendlyAssetsDir: string
) {
  // 获取插件目录
  const pluginDir = dirname(require.main?.filename || __dirname);
  const scriptPath = join(pluginDir, '../scripts', `${operation}_qr.py`);
  
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
    const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 }); // 30秒超时
    
    if (stderr) {
      api.logger.warn("Python script stderr:", stderr);
    }
    
    if (existsSync(outputPath)) {
      if (isWebChannel) {
        let responseText = `## 📱 QR Code Generated Successfully!

### 🔗 Content
- **Content**: \`${input}\`

### 📁 File Location  
- **Saved to**: \`${friendlyOutputDir}\`

### 🎨 Quick Actions
- **Open Directory**: \`open "${outputDir}"\`
- **Copy Path**: \`${friendlyOutputDir}/${fileName}\``;

        if (options.logoPath) {
          responseText += `\n\n### 🖼️ Logo Assets
- **Your logo**: \`${createFriendlyPathDisplay(options.logoPath)}\`
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
        return { 
          content: [{ 
            type: "image", 
            media: outputPath,
            caption: `✅ QR code ${operation} completed successfully`
          }] 
        };
      }
    } else {
      throw new Error("Python script executed but no output file generated");
    }
  } finally {
    // 清理临时文件
    try {
      // 保留临时文件用于调试，生产环境可以删除
    } catch (e) {
      // 忽略清理错误
    }
  }
}

async function executeNodeJSQR(
  api: any, 
  operation: string, 
  input: string, 
  options: any, 
  outputDir: string, 
  isWebChannel: boolean, 
  friendlyOutputDir: string, 
  friendlyAssetsDir: string
) {
  if (operation !== "generate") {
    throw new Error(`Node.js fallback only supports 'generate' operation. Please install Python and required packages for decode/beautify functionality.`);
  }
  
  try {
    const QRCode = await import('qrcode');
    
    // 生成基础二维码
    const qrBuffer = await QRCode.toBuffer(input, {
      width: Math.min(Math.max((options.size || 10) * 20, 20), 1000),
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
      let responseText = `## 📱 QR Code Generated Successfully!

### 🔗 Content
- **Content**: \`${input}\`

### 📁 File Location
- **Saved to**: \`${friendlyOutputDir}\`

### 🎨 Quick Actions  
- **Open Directory**: \`open "${outputDir}"\`
- **Copy Path**: \`${friendlyOutputDir}/${fileName}\``;

      if (options.logoPath) {
        responseText += `\n\n### 🖼️ Logo Assets
- **Your logo**: \`${createFriendlyPathDisplay(options.logoPath)}\`
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
      return { 
        content: [{ 
          type: "image", 
          media: outputPath,
          caption: "✅ Basic QR code generated (Node.js fallback)"
        }] 
      };
    }
  } catch (error: any) {
    throw new Error(`Node.js QR generation failed: ${error.message}`);
  }
}