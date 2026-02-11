# OpenClaw QR Code - Dual Mode

![OpenClaw QR Code](https://img.shields.io/badge/OpenClaw-QR_Code-2ea44f)

A comprehensive QR code solution for OpenClaw with **two installation modes** to suit different needs:

- **AgentSkill Mode** (Recommended for most users): Lightweight, secure, no dependencies
- **Plugin Mode** (For advanced features): Logo embedding, gradient colors, enhanced decoding

## 🎯 Which Mode Should You Choose?

| Feature | AgentSkill Mode | Plugin Mode |
|---------|----------------|-------------|
| **Installation** | Simple copy | Requires plugin install |
| **Dependencies** | None | Python 3.8+ required |
| **Logo Support** | ❌ No | ✅ Yes |
| **Gradient Colors** | ❌ No | ✅ Yes |
| **WhatsApp Ready** | ✅ Yes | ✅ Yes |
| **Security** | ✅ Hardened | ✅ Hardened |
| **Use Case** | Basic QR generation | Brand/custom QR codes |

## 🚀 Installation

### Option 1: AgentSkill Mode (Recommended)
Perfect for most users who need basic QR code generation.

```bash
# Clone the repository
git clone https://github.com/zouyawen/openclaw-qrcode.git

# Copy the AgentSkill to your OpenClaw skills directory
cp -r openclaw-qrcode/AGENTSKILL/qr-code ~/.openclaw/skills/

# Restart OpenClaw
```

**Usage**: Use natural language commands like `/qr generate https://example.com color=red`

### Option 2: Plugin Mode (Advanced Features)
Choose this if you need logo embedding, gradient colors, or enhanced decoding.

```bash
# Install via OpenClaw plugin manager
openclaw plugin install https://github.com/zouyawen/openclaw-qrcode

# Or manual installation
git clone https://github.com/zouyawen/openclaw-qrcode.git
cd openclaw-qrcode/PLUGIN
# Follow PLUGIN/README.md for detailed setup
```

**Requirements**: Python 3.8+ with `qrcode[pil] pillow pyzbar opencv-python numpy`

## 📁 Repository Structure

```
openclaw-qrcode/
├── README.md                 # This file
├── AGENTSKILL/              # Lightweight AgentSkill mode
│   └── qr-code/             # Ready-to-copy skill folder
├── PLUGIN/                  # Full plugin mode
│   ├── openclaw.plugin.json # Plugin manifest
│   ├── scripts/             # Python implementation  
└── docs/                    # Detailed documentation
```

## 🔒 Security

Both modes include:
- Input validation and sanitization
- Protection against path traversal attacks
- Safe error handling
- Secure temporary file management

## 📝 Usage Examples

### AgentSkill Mode
```
/qr generate https://mzt315.com color=red backgroundColor=white
/qr decode [attach QR image]
/qr beautify [attach QR image] color=green size=12
```

### Plugin Mode
Same commands, plus advanced options:
```
/qr generate https://mzt315.com logoPath=/path/to/logo.png gradient=true
```

## 🤝 Contributing

Contributions welcome! Please maintain both modes when adding new features.

## 📜 License

MIT License