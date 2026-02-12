---
name: qr-code
description: |
  Handle ALL QR code related requests including:
  - Generate QR codes from any text, URL, or content
  - Decode/extract data from QR code images  
  - Beautify/enhance existing QR codes with colors, logos, and styling
  - Convert between different QR code formats
  - Process QR codes for any OpenClaw channel (WhatsApp, Telegram, etc.)
  Use this skill whenever user mentions QR codes, barcodes, scanning, encoding data, or requests to create/read/modify QR codes.
openclaw:
  homepage: https://github.com/zouyawen/openclaw-qrcode
  user-invocable: true
  emoji: "📱"
---

# QR Code Skill

**⚠️ This skill requires the companion plugin to function!**

Install the plugin first:
```bash
npm install @zouyawen/openclaw-qr-code
```

Then place this skill file in your OpenClaw skills directory.

## Features
- **Generate**: Create QR codes with custom colors, background, size, logo overlay, and format (PNG, JPG, SVG)
- **Decode**: Extract data from QR code images
- **Beautify**: Enhance existing QR codes with new styling while preserving data
- **Cross-channel compatibility**: Works seamlessly across all OpenClaw channels including WhatsApp, Telegram, Discord, etc.
- **Automatic format handling**: Converts formats as needed for channel compatibility
- **Enhanced security**: Path traversal protection, input validation, and secure error handling
- **WhatsApp optimization**: Automatic SVG-to-PNG conversion for WhatsApp compatibility

## Smart Auto-Detection

Once installed, this plugin will **automatically handle all QR code related requests** without requiring specific commands:

- Simply mention "QR code", "barcode", or "scan" in your conversation
- Attach an image and ask "what does this say?"
- Request to "make it look better" or "change the colors" 
- The AI will automatically detect your intent and use the appropriate plugin function

## Natural Language Examples

The AI will automatically use this skill when you say:

- "Create a QR code for my website"
- "What does this QR code say?" (with image attached)
- "Make this QR code look better with our brand colors"
- "Generate a scannable QR code for my contact info"
- "Convert this QR code to a different format"
- "I need a QR code that works well on WhatsApp"

## Security Features
- **Path traversal protection**: Logo paths are validated to prevent directory traversal attacks
- **Input sanitization**: All color, size, and format parameters are strictly validated
- **Secure error handling**: Comprehensive try-catch blocks prevent information leakage
- **File access restrictions**: Only allows access to files within the workspace directory

## Usage Examples

### Generate QR Code
```
/qr generate https://mzt315.com color=red backgroundColor=white size=10 format=png
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
/qr generate https://mzt315.com logoPath=logo.png
```
Note: Logo paths must be relative to the workspace and cannot contain `..` or absolute paths.

## WhatsApp Compatibility
- Automatically handles WhatsApp's format requirements (PNG/JPG only)
- **Automatic SVG-to-PNG conversion**: If SVG is requested on WhatsApp, it's automatically converted to PNG
- Returns MEDIA paths that can be sent directly to any channel
- Optimized for mobile viewing with appropriate sizing

## Input Validation
- **Colors**: Must be valid CSS color names or hex codes (e.g., "red", "#FF0000")
- **Background Colors**: Same validation as colors
- **Size**: Must be a number between 1 and 50 (inclusive)
- **Format**: Must be one of: png, jpg, jpeg, svg
- **Logo Path**: Must be a relative path within the workspace directory

## Installation Requirements

This skill requires the [@zouyawen/openclaw-qr-code](https://www.npmjs.com/package/@zouyawen/openclaw-qr-code) plugin:

```bash
npm install @zouyawen/openclaw-qr-code
```

After installing the plugin, download this skill file from ClawHub and place it in your OpenClaw skills directory.

## Technical Details
This skill leverages OpenClaw's built-in `qr_code_operations` tool which supports both Python-based advanced features and Node.js fallback for maximum compatibility across different environments. All operations include comprehensive error handling and security validation.