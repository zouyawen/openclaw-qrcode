import { Type } from "@sinclair/typebox";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

// Base64 编码函数
function encodeBase64(filePath: string): string {
  const buffer = readFileSync(filePath);
  return buffer.toString('base64');
}

// Web 友好的响应生成器
function createWebFriendlyResponse(operation: string, input: string, options: any, filePath: string, success: boolean = true) {
  if (!success) {
    return {
      content: [{
        type: "text",
        text: `## ❌ QR Code Operation Failed\n\nThe ${operation} operation could not be completed. Please check your input and try again.`
      }]
    };
  }

  const base64Data = encodeBase64(filePath);
  const format = options.format || 'png';
  
  // 根据操作类型生成不同的界面
  let interfaceText = '';
  
  switch (operation) {
    case 'generate':
      interfaceText = generateQRInterface(input, options, base64Data, format);
      break;
    case 'decode':
      const decodedData = readFileSync(filePath, 'utf8');
      const result = JSON.parse(decodedData);
      interfaceText = decodeQRInterface(result, base64Data);
      break;
    case 'beautify':
      interfaceText = beautifyQRInterface(input, options, base64Data, format);
      break;
    default:
      interfaceText = basicQRInterface(base64Data, format);
  }
  
  return {
    content: [{
      type: "text",
      text: interfaceText
    }]
  };
}

function generateQRInterface(content: string, options: any, base64Data: string, format: string) {
  const color = options.color || 'black';
  const bgColor = options.backgroundColor || 'white';
  const hasLogo = options.logoPath ? '✅ Yes' : '❌ No';
  
  return `
## 📱 QR Code Generated Successfully!

### 🔍 Preview
![QR Code](data:image/${format};base64,${base64Data})

### 📋 Details
- **Content**: \`${content}\`
- **Color**: \`${color}\`
- **Background**: \`${bgColor}\`
- **Format**: \`${format.toUpperCase()}\`
- **Logo**: ${hasLogo}

### 🛠️ Quick Actions
- **Copy Content**: Click to select → \`Ctrl+C\` / \`Cmd+C\`
  \`\`\`
  ${content}
  \`\`\`
- **Download**: Right-click on the image above and select "Save Image As..."
- **Regenerate**: Ask me to create a new QR code with different settings!

### 🎨 Customization Options
You can request:
- Different colors: "Make it red on white background"
- Add logo: "Add my company logo to the QR code"  
- Change format: "Generate as SVG instead of PNG"
- Resize: "Make it larger/smaller"

> 💡 **Tip**: For best scanning results, maintain good contrast between QR code and background!
`;
}

function decodeQRInterface(result: any, base64Data: string) {
  if (!result.success) {
    return `## ❌ Decoding Failed\n\n${result.error}`;
  }
  
  const data = result.results[0]?.data || 'No data found';
  
  return `
## 🔍 QR Code Decoded Successfully!

### 📄 Extracted Data
\`\`\`
${data}
\`\`\`

### 📊 Results
- **Codes Found**: ${result.count}
- **Data Type**: ${result.results[0]?.type || 'Unknown'}

### 🔄 Next Steps
- **Visit URL**: If this is a web link, you can click/copy it
- **Save Data**: Copy the content above for your records  
- **Analyze**: Ask me to help analyze or process this data further

> 💡 **Note**: QR codes can contain URLs, text, contact info, WiFi credentials, and more!
`;
}

function beautifyQRInterface(original: string, options: any, base64Data: string, format: string) {
  return `
## ✨ Beautiful QR Code Created!

### 🎨 Preview
![Beautiful QR Code](data:image/${format};base64,${base64Data})

### 🎯 Customization Applied
- **Original Content**: \`${original}\`
- **Enhancements**: 
  ${options.gradient ? '✅ Gradient colors' : ''}
  ${options.logoPath ? '✅ Custom logo' : ''}
  ${options.roundedCorners ? '✅ Rounded corners' : ''}
  ${options.color ? `✅ Custom color: ${options.color}` : ''}

### 💾 Usage Tips
- **Print Ready**: High quality for business cards, posters, etc.
- **Brand Consistent**: Matches your requested styling
- **Scannable**: Maintains error correction for reliable scanning

### 🔄 Want More?
Ask me to:
- Adjust colors further
- Try different logo positions
- Add more visual effects
- Export in different formats
`;
}

function basicQRInterface(base64Data: string, format: string) {
  return `
## 📱 QR Code Ready!

### 🔍 Preview
![QR Code](data:image/${format};base64,${base64Data})

### 📥 How to Use
1. **Scan**: Use your phone's camera or QR scanner app
2. **Save**: Right-click image → "Save Image As..."
3. **Share**: Copy the image and share anywhere!

> This QR code was generated using OpenClaw's built-in functionality.
`;
}

export async function createWebEnhancedQRResponse(api: any, operation: string, input: string, options: any, tempOutput: string, success: boolean = true) {
  try {
    return createWebFriendlyResponse(operation, input, options, tempOutput, success);
  } catch (error) {
    api.logger.error("Web interface generation failed:", error);
    // Fallback to basic response
    return {
      content: [{
        type: "text",
        text: success ? 
          `QR code ${operation} completed. Check your file system for the output.` :
          `QR operation failed: ${error.message}`
      }]
    };
  }
}