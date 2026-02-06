# OpenClaw QR Code Plugin

A comprehensive QR code plugin for OpenClaw that provides generation, decoding, and beautification capabilities with both Python (full-featured) and Node.js (basic fallback) implementations.

## Features

- **QR Code Generation**: Create QR codes from text or URLs
- **QR Code Decoding**: Extract data from QR code images  
- **Beautification**: Apply custom colors, logos, gradients, and styling
- **Multiple Formats**: PNG, JPG, SVG output support
- **Hybrid Implementation**: Python for advanced features, Node.js fallback for basic functionality
- **Automatic Detection**: Seamlessly switches between implementations based on availability
- **Privacy-Aware**: No hardcoded user-specific paths, uses relative paths and environment variables
- **Smart Directory Hints**: Automatically shows relevant directories for file operations

## Installation

### 1. Install the Plugin

```bash
# From local directory (adjust path as needed)
openclaw plugins install /path/to/openclaw-qrcode-plugin

# Or link for development
openclaw plugins install -l /path/to/openclaw-qrcode-plugin
```

### 2. Install Dependencies (Recommended)

For full functionality, install Python dependencies:

```bash
# Use quotes to avoid shell globbing issues
pip install "qrcode[pil]" pillow pyzbar opencv-python numpy
```

Node.js dependencies are automatically handled by the plugin.

### 3. Enable the Plugin

The plugin should be automatically enabled after installation. Verify with:

```bash
openclaw plugins list
```

## Usage

Once installed, you can use the QR code functionality through natural language:

- "Generate a QR code for https://example.com"
- "Extract data from this QR code image"  
- "Create a beautiful QR code with our company logo and brand colors"
- "Make a red QR code on white background for our event"

## Configuration

The plugin works out of the box with intelligent defaults that respect user privacy. However, you can customize behavior through both plugin configuration and tool parameters.

### Plugin Configuration (in openclaw.json)

```json5
{
  plugins: {
    entries: {
      "qr-code": {
        enabled: true,
        config: {
          // Python executable path
          "pythonPath": "python3",
          
          // Enable advanced features requiring Python
          "enableAdvancedFeatures": true,
          
          // Web channel specific settings
          "outputDirectory": "./qr-codes/",
          "assetsDirectory": "./qr-assets/"
        }
      }
    }
  }
}
```

### Privacy-Aware Path Resolution

The plugin uses intelligent path resolution to avoid exposing user-specific information:

- **Default behavior**: Uses `./qr-codes/` relative to your OpenClaw workspace
- **User-friendly paths**: Supports `~/` for home directory 
- **No hardcoded paths**: Never exposes actual user directory structure in responses
- **Cross-platform**: Works on Windows, macOS, and Linux

### Smart Directory Hints

When you use the plugin, it will automatically provide helpful directory information:

**For QR Code Generation:**
```
📁 Generated QR code saved to: ./qr-codes/
💡 Tip: Files are saved relative to your OpenClaw workspace
```

**For Logo/Asset Upload:**
```
📤 To add a logo, place your image file in: ./qr-assets/
💡 Supported formats: PNG, JPG, GIF (transparent background recommended)
```

This ensures users always know where to find generated files or where to place assets, without exposing sensitive path information.

### Tool Parameters (per request)

- `color`: QR code color (default: black)
- `backgroundColor`: Background color (default: white)  
- `logoPath`: Path to logo image file (relative to assets directory)
- `size`: QR code size multiplier (default: 10)
- `format`: Output format - png, jpg, or svg (default: png)

### Channel-Specific Behavior

- **Web Channel**: Saves images to configured output folder and offers Base64 output option
- **Other Channels** (Telegram, WhatsApp, etc.): Directly displays images in chat

## Technical Details

### Hybrid Architecture

- **Python Scripts**: Handle advanced features (decoding, beautification, logo embedding)
- **Node.js Fallback**: Provides basic QR generation when Python is unavailable
- **Automatic Routing**: The plugin detects available implementations and routes requests appropriately

### File Structure

```
openclaw-qrcode-plugin/
├── openclaw.plugin.json     # Plugin manifest
├── index.ts                 # Plugin entry point  
├── package.json             # NPM package info
├── README.md                # This documentation
└── skills/qr-code/          # Associated skill
    ├── SKILL.md             # Skill documentation
    └── scripts/             # Python scripts
        ├── generate_qr.py   # QR generation
        ├── decode_qr.py     # QR decoding  
        └── beautify_qr.py   # QR beautification
```

## Requirements

### System Requirements
- OpenClaw 2026.1.0 or later
- Node.js 18+ (for plugin runtime)
- Python 3.8+ (recommended for full features)

### Optional Dependencies
- **Python packages** (for full functionality):
  - `qrcode[pil]` - QR code generation
  - `pillow` - Image processing  
  - `pyzbar` - QR code decoding
  - `opencv-python` - Advanced image processing
  - `numpy` - Numerical operations

## Troubleshooting

### Common Issues

1. **"Python not available" warnings**: Install Python and required packages for full functionality
2. **Logo not appearing**: Ensure logo file path is correct and image format is supported
3. **Decoding failures**: Use high-quality, well-lit QR code images
4. **Permission errors**: Ensure OpenClaw has write access to configured directories

### Debugging

Check plugin status:
```bash
openclaw plugins info qr-code
```

View logs:
```bash
openclaw gateway logs
```

## Development

### Testing Locally

1. Link the plugin for development:
   ```bash
   openclaw plugins install -l /path/to/openclaw-qrcode-plugin
   ```

2. Restart OpenClaw Gateway:
   ```bash
   openclaw gateway restart
   ```

3. Test functionality through chat interface

### Building Distribution

To create a distributable package:

```bash
# Package as tarball
npm pack

# Or create a .skill file for the skill component
# (requires OpenClaw skill packaging tools)
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please open issues or pull requests on the repository.

## Support

For issues or questions, please contact the plugin maintainer or open an issue in the repository.