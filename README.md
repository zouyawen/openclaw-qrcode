# OpenClaw QR Code - Smart Auto-Detection

![OpenClaw QR Code](https://img.shields.io/badge/OpenClaw-QR_Code-2ea44f)

A comprehensive QR code solution for OpenClaw with **smart auto-detection** that automatically handles all QR code related requests without requiring specific commands.

## 🎯 Quick Start

### From ClawHub (Basic Features)
If you found this plugin on [ClawHub](https://clawhub.ai/zouyawen/openclaw-qr-code), you can install the basic version directly:

1. Download the skill from ClawHub
2. Extract to `~/.openclaw/skills/qr-code/`
3. Restart OpenClaw: `openclaw gateway restart`

> **💡 Want Full Features?**  
> The ClawHub version only includes basic QR code functionality. For **rounded dots, gradient colors, logo integration, and natural language support**, visit our [GitHub repository](https://github.com/zouyawen/openclaw-qrcode) for complete installation!

### From GitHub (Full Features - Recommended)
```bash
# One-click full installation
curl -s https://raw.githubusercontent.com/zouyawen/openclaw-qrcode/main/install.sh | bash
openclaw gateway restart
```

## 🤖 Smart Auto-Detection Features

Once installed, this plugin will **automatically handle all QR code related requests**:

- **Natural Language**: "生成一个我的网站二维码" or "Create a QR code for my website"
- **Auto Detection**: Attach an image and ask "这个二维码是什么内容？" 
- **Smart Optimization**: Automatically optimizes for the current channel (WhatsApp, Telegram, etc.)
- **Context Awareness**: Detects intent from natural conversation
- **No Commands Needed**: Just speak naturally!

## 🚀 Installation

### Full Feature Installation (Recommended)
```bash
curl -s https://raw.githubusercontent.com/zouyawen/openclaw-qrcode/main/install.sh | bash
openclaw gateway restart
```

### Basic Feature Installation (From ClawHub)
```bash
# Copy skill to OpenClaw skills directory  
mkdir -p ~/.openclaw/skills/qr-code
# Download skill.zip from ClawHub and extract here
unzip skill.zip -d ~/.openclaw/skills/qr-code/
openclaw gateway restart
```

## 📁 Repository Structure

```
openclaw-qrcode/
├── README.md                 # This file
├── AGENTSKILL/              # Smart skill with auto-detection
│   └── qr-code/             # Skill folder
└── PLUGIN/                  # Full plugin with advanced features
    ├── openclaw.plugin.json # Plugin manifest
    ├── scripts/             # Python implementation  
    └── index.ts            # Enhanced plugin with smart detection
```

## 🔒 Security

- Input validation and sanitization
- Protection against path traversal attacks  
- Safe error handling
- Secure temporary file management

## 🎯 Usage Examples

### Natural Language (Recommended)
- "生成一个蓝色的二维码，内容是 https://example.com"
- "这个二维码图片里是什么内容？" (attach image)
- "让这个二维码看起来更好看，用我们的品牌颜色"
- "为 WhatsApp 优化这个二维码"

### Command Mode (Optional)
```
/qr generate https://example.com color=red backgroundColor=white
/qr decode [attach QR image]  
/qr beautify [attach QR image] color=blue size=12
```

## 📜 License

MIT License