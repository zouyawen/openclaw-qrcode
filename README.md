# OpenClaw QR Code Plugin + Skill

![OpenClaw QR Code](https://img.shields.io/badge/OpenClaw-QR_Code-2ea44f)

A comprehensive QR code solution for OpenClaw with **advanced generation, decoding, and beautification capabilities**.

## 🚀 Installation

This project requires **both the plugin and the skill** to function properly.

### Step 1: Install the Plugin
```bash
# Option A: Install from npm (recommended)
npm install @zouyawen/openclaw-qr-code

# Option B: Install from GitHub
openclaw plugin install https://github.com/zouyawen/openclaw-qrcode
```

### Step 2: Install the Skill
1. Visit [ClawHub QR Code Skill](https://clawhub.com/skills/qr-code) (once published)
2. Download the `qr-code.skill` file
3. Place it in your OpenClaw skills directory: `~/.openclaw/skills/`

### Step 3: Install Python Dependencies (Required)
```bash
# Required for advanced features
pip install qrcode[pil] pillow pyzbar opencv-python numpy

# On macOS, you may also need:
brew install zbar
```

### Step 4: Restart OpenClaw
```bash
openclaw gateway restart
```

## 📁 Repository Structure

```
openclaw-qrcode/
├── README.md                 # This file
├── AGENTSKILL/              # OpenClaw Skill (for ClawHub)
│   └── qr-code/             # Skill folder with SKILL.md
├── PLUGIN/                  # OpenClaw Plugin (for npm)
│   ├── openclaw.plugin.json # Plugin manifest
│   ├── index.ts            # Plugin main code
│   └── scripts/            # Python implementation
└── LICENSE                  # MIT License
```

## 🔒 Security Features

- **Path traversal protection**: Prevents directory traversal attacks
- **Input validation**: All parameters are strictly validated  
- **Secure error handling**: No sensitive information leakage
- **File access restrictions**: Only allows access within workspace

## 📝 Usage Examples

```
/qr generate https://example.com color=red backgroundColor=white size=10 format=png
/qr decode [attach QR code image]
/qr beautify [attach QR code image] color=green backgroundColor=black size=12
/qr generate https://brand.com logoPath=logo.png gradient=true
```

## 🌟 Features

- **Generate**: Create QR codes with custom colors, background, size, logo overlay, and format (PNG, JPG, SVG)
- **Decode**: Extract data from QR code images
- **Beautify**: Enhance existing QR codes with new styling while preserving data
- **Cross-channel compatibility**: Works across all OpenClaw channels including WhatsApp, Telegram, Discord
- **Advanced customization**: Logo embedding, gradient colors, rounded corners
- **WhatsApp optimization**: Automatic format conversion for WhatsApp compatibility

## 🤝 Contributing

Contributions welcome! Please maintain the Plugin + Skill separation when adding new features.

## 📜 License

MIT License