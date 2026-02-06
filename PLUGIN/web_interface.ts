import { Type } from "@sinclair/typebox";
import { readFileSync } from "fs";
import { join } from "path";

// Web-friendly QR Code interface
export function createWebInterface(qrData: {
  base64?: string;
  filePath?: string;
  input: string;
  options: any;
  operation: string;
  success: boolean;
  errorMessage?: string;
}) {
  const { base64, filePath, input, options, operation, success, errorMessage } = qrData;
  
  if (!success) {
    return {
      content: [{
        type: "text" as const,
        text: `## ❌ QR Code Operation Failed\n\n**Error:** ${errorMessage}\n\nPlease check your input and try again.`
      }]
    };
  }

  // Try to get base64 if not provided
  let finalBase64 = base64;
  if (!finalBase64 && filePath) {
    try {
      const buffer = readFileSync(filePath);
      finalBase64 = buffer.toString('base64');
    } catch (e) {
      console.warn("Failed to read QR file for base64:", e);
    }
  }

  const color = options?.color || 'black';
  const backgroundColor = options?.backgroundColor || 'white';
  const format = options?.format || 'png';
  const logoPath = options?.logoPath;

  let qrImageSection = '';
  if (finalBase64) {
    qrImageSection = `![QR Code](data:image/png;base64,${finalBase64})`;
  } else if (filePath) {
    // Use relative path display for privacy
    const displayPath = filePath.replace(process.env.HOME || '', '~');
    qrImageSection = `**QR Code saved to:** \`${displayPath}\`\n\n*(Open this file to view your QR code)*`;
  } else {
    qrImageSection = "**QR Code generated successfully!**";
  }

  const operationLabels = {
    generate: "Generated",
    decode: "Decoded",
    beautify: "Beautified"
  };

  const quickActions = operation === 'generate' ? `
### 🚀 Quick Actions

**Copy your content:**
\`\`\`
${input}
\`\`\`

**Common customizations you can request:**
- "Make it red with white background"
- "Add our company logo to the QR code"  
- "Create an SVG version for printing"
- "Make it larger with more error correction"

` : '';

  const optionsTable = `
### ⚙️ Options Used

| Parameter | Value |
|-----------|-------|
| **Operation** | ${operationLabels[operation as keyof typeof operationLabels] || operation} |
| **Content** | \`${input}\` |
| **Color** | \`${color}\` |
| **Background** | \`${backgroundColor}\` |
| **Format** | \`${format.toUpperCase()}\`${logoPath ? `\n| **Logo** | \`${logoPath}\` |` : ''}
`;

  const markdownResponse = `
## 📱 ${operationLabels[operation as keyof typeof operationLabels] || operation} QR Code

${qrImageSection}

${optionsTable}

${quickActions}

---
*Powered by OpenClaw QR Code Plugin • [Learn more about customization options](#)*
`;

  return {
    content: [{
      type: "text" as const,
      text: markdownResponse
    }]
  };
}

// Register web-friendly commands
export function registerWebCommands(api: any) {
  // Color change command
  api.registerCommand({
    name: "qr-color",
    description: "Change QR code color (web interface)",
    acceptsArgs: true,
    requireAuth: false,
    handler: async (ctx: any) => {
      const color = ctx.args?.trim() || "black";
      return { 
        text: `✅ QR code color set to: **${color}**\n\nNow generate a new QR code with your desired content!` 
      };
    }
  });

  // Format change command  
  api.registerCommand({
    name: "qr-format",
    description: "Change QR code output format (web interface)",
    acceptsArgs: true,
    requireAuth: false,
    handler: async (ctx: any) => {
      const format = ctx.args?.trim() || "png";
      return { 
        text: `✅ QR code format set to: **${format.toUpperCase()}**\n\nPNG works best for web, SVG for print!` 
      };
    }
  });

  // Help command
  api.registerCommand({
    name: "qr-help",
    description: "Show QR code plugin help (web interface)",
    acceptsArgs: false,
    requireAuth: false,
    handler: async (ctx: any) => {
      return { 
        text: `## 🆘 QR Code Plugin Help
        
### Basic Usage
- **Generate**: "Create QR code for https://example.com"
- **Decode**: Upload QR image and say "decode this"
- **Beautify**: "Make beautiful QR with red color and logo"

### Quick Commands
- \`/qr-color red\` - Set QR color
- \`/qr-format svg\` - Set output format  
- \`/qr-help\` - Show this help

### Advanced Options
- **Colors**: Any CSS color name or hex (#FF0000)
- **Formats**: png, jpg, svg
- **Logo**: Provide file path to your logo image

*All features work automatically - just describe what you want!*`
      };
    }
  });
}