---
name: qr-code
description: Generate, decode, and beautify QR codes with customizable colors, logos, and formats. Works across all OpenClaw channels including WhatsApp.
metadata:
  {
    "openclaw": {
      "homepage": "https://github.com/yourname/openclaw-qr-code",
      "user-invocable": true,
      "emoji": "📱"
    }
  }
---

# QR Code Skill

Generate, decode, and beautify QR codes with full customization options and enhanced security.

## 📦 Installation

This skill requires the companion plugin to function:

```bash
npm install @yourname/openclaw-qr-code
```

Then install Python dependencies for advanced features:

```bash
pip install qrcode[pil] pillow pyzbar opencv-python numpy
```

Place this skill file in your OpenClaw skills directory.

## 🌟 Features
- **Generate**: Create QR codes with custom colors, background, size, logo overlay, and format (PNG, JPG, SVG)
- **Decode**: Extract data from QR code images
- **Beautify**: Enhance existing QR codes with new styling while preserving data
- **Cross-channel compatibility**: Works seamlessly across all OpenClaw channels including WhatsApp, Telegram, Discord, etc.
- **Automatic format handling**: Converts formats as needed for channel compatibility
- **Enhanced security**: Path traversal protection, input validation, and secure error handling
- **WhatsApp optimization**: Automatic SVG-to-PNG conversion for WhatsApp compatibility

## 🔒 Security Features
- **Path traversal protection**: All file paths are validated to prevent directory traversal attacks
- **Input sanitization**: All color, size, and format parameters are strictly validated
- **Secure error handling**: Comprehensive try-catch blocks prevent information leakage
- **File access restrictions**: Only allows access to files within workspace or designated asset directories
- **Workspace isolation**: All operations are confined to safe directories

## 🚀 Usage Examples

### Generate QR Code
```
/qr generate https://example.com color=red backgroundColor=white size=10 format=png
```

### Decode QR Code
```
/qr decode [attach QR code image]
```

### Beautify QR Code
```
/qr beautify [attach QR code image] color=green backgroundColor=black size=12
```

### With Logo (Secure)
```
/qr generate https://example.com logoPath=logo.png
```
Note: Logo paths must be relative to the workspace or assets directory and cannot contain `..` or absolute paths.

## 📱 WhatsApp Compatibility
- Automatically handles WhatsApp's format requirements (PNG/JPG only)
- **Automatic SVG-to-PNG conversion**: If SVG is requested on WhatsApp, it's automatically converted to PNG
- Returns MEDIA paths that can be sent directly to any channel
- Optimized for mobile viewing with appropriate sizing

## ⚙️ Input Validation
- **Colors**: Must be valid CSS color names or hex codes (e.g., "red", "#FF0000")
- **Background Colors**: Same validation as colors
- **Size**: Must be a number between 1 and 50 (inclusive)
- **Format**: Must be one of: png, jpg, jpeg, svg
- **Logo Path**: Must be a relative path within the workspace or assets directory

## 🛠️ Configuration Options

Add to your OpenClaw config:

```json
{
  "plugins": {
    "entries": {
      "qr-code": {
        "enabled": true,
        "config": {
          "outputDirectory": "./qr-codes/",
          "assetsDirectory": "./qr-assets/",
          "enableAdvancedFeatures": true
        }
      }
    }
  }
}
```

## 📁 Directory Structure

By default, files are saved to:
- **Output**: `./qr-codes/` (in your OpenClaw workspace)
- **Assets**: `./qr-assets/` (for logo files)

## 🔄 Fallback Behavior

If Python is not available:
- Only basic generation works (Node.js fallback)
- Limited color options
- No logo support  
- No decode/beautify functionality

## ❓ Troubleshooting

### Common Issues
- **"Plugin not found"**: Ensure you've installed the npm package
- **"Python packages missing"**: Install required Python dependencies
- **"Permission denied"**: Check directory write permissions
- **"Invalid logo path"**: Ensure logo is in workspace or assets directory

### Python Installation
```bash
# Check Python version
python3 --version

# Install required packages
pip install --upgrade pip
pip install qrcode[pil] pillow pyzbar opencv-python numpy
```

## 📚 Technical Details

This skill leverages the `@yourname/openclaw-qr-code` plugin which provides the `qr_code_operations` tool. The plugin supports both Python-based advanced features and Node.js fallback for maximum compatibility across different environments. All operations include comprehensive error handling and security validation.