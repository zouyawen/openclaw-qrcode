---
name: qr-code
description: Generate, decode, and beautify QR codes with advanced customization including rounded dots, gradient colors, and logo integration. Smart auto-detection works with natural language across all OpenClaw channels.
openclaw:
  homepage: https://github.com/zouyawen/openclaw-qrcode
  user-invocable: true
  emoji: "📱"
---

# QR Code Skill - Smart Natural Language

**✨ No commands needed! Just speak naturally!**

This skill provides **smart auto-detection** that automatically handles QR code requests from natural conversation:

- "生成一个我的网站二维码" → Creates QR code for your website
- "这个二维码图片是什么内容？" → Decodes attached QR image  
- "让二维码看起来更现代，用圆点样式" → Applies rounded dots with gradient
- "在中间加个logo" → Integrates your logo from `qr-assets/` folder

## 🚀 Advanced Features

### ✨ Visual Customization
- **Rounded Dots**: Modern circular modules instead of squares
- **Gradient Colors**: Each dot has different color (position-based gradient)
- **Logo Integration**: Overlay your logo in the center (auto-safe area)
- **High Error Correction**: Ensures scannability even with logo overlay

### 🌐 Cross-Channel Compatibility
- **WhatsApp**: Auto PNG conversion, mobile-optimized sizing
- **Telegram**: Full feature support with media handling  
- **WebChat**: Base64 preview + file download
- **All Channels**: Consistent experience everywhere

### 🔒 Security & Safety
- **Path Validation**: Logo paths restricted to workspace only
- **Input Sanitization**: All parameters strictly validated
- **Error Handling**: Friendly messages with clear guidance
- **File Safety**: Temporary files auto-cleanup

## 📁 File Locations

**Generated QR Codes**: `~/clawd/qr-codes/`  
**Your Logo Assets**: `~/clawd/qr-assets/` (put your logo.png here)

## 💬 Natural Language Examples

### Generation
- "帮我生成一个彩色的圆点二维码，链接是 https://example.com"
- "用蓝色和黄色做渐变效果的二维码"
- "为我的网站创建一个带logo的现代风格二维码"

### Decoding  
- "这个二维码图片里是什么内容？" (attach image)
- "解码一下这个二维码"

### Beautification
- "让这个二维码更好看，用我们的品牌颜色"
- "给这个二维码加上圆点样式和渐变"

## ⚙️ Installation

**Prerequisite**: Install the companion plugin first:
```bash
git clone https://github.com/zouyawen/openclaw-qrcode.git
mkdir -p ~/.openclaw/plugins
cp -r openclaw-qrcode/PLUGIN ~/.openclaw/plugins/qr-code-plugin
cd ~/.openclaw/plugins/qr-code-plugin && npm install
```

**Install Skill**: Copy the AGENTSKILL folder to `~/.openclaw/skills/`
```bash
cp -r openclaw-qrcode/AGENTSKILL/qr-code ~/.openclaw/skills/
openclaw gateway restart
```

## 🎯 Technical Details

This skill leverages the enhanced `qr_code_operations` tool with:
- Python-based advanced rendering (rounded dots, gradients)
- Node.js fallback for basic functionality  
- Smart intent detection from natural language
- Channel-specific optimizations
- Comprehensive security validation

**Note**: The companion plugin is required for advanced features (rounded dots, gradients, logo integration).