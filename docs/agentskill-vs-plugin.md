# AgentSkill vs Plugin Mode - Detailed Comparison

## AgentSkill Mode

### Overview
The AgentSkill mode is a lightweight implementation that leverages OpenClaw's built-in `qr_code_operations` tool. It provides essential QR code functionality without external dependencies.

### Technical Details
- **Implementation**: JavaScript wrapper around built-in OpenClaw tools
- **Dependencies**: None (uses OpenClaw's native capabilities)
- **Security**: Hardened against path traversal and input validation issues
- **Channel Support**: Full compatibility with all OpenClaw channels including WhatsApp

### Features
- QR code generation from text/URLs
- Custom foreground and background colors (named colors and HEX values)
- Adjustable size (1-100x)
- Multiple output formats (PNG, JPG, SVG)
- Automatic format conversion for WhatsApp (SVG → PNG)
- Basic QR code decoding
- Simple beautification options

### Limitations
- No logo embedding support
- No gradient color support
- Limited to basic QR code customization
- Decoding capabilities depend on OpenClaw's built-in tools

### Installation
Simply copy the `AGENTSKILL/qr-code` folder to your OpenClaw skills directory:
```bash
cp -r AGENTSKILL/qr-code ~/.openclaw/skills/
```

### Best For
- Users who need basic QR code generation
- Environments where installing Python dependencies is not possible
- WhatsApp and other messaging channel automation
- Quick setup with minimal configuration

## Plugin Mode

### Overview
The Plugin mode provides comprehensive QR code functionality through a dedicated OpenClaw plugin with Python backend. It offers advanced features for users who need more sophisticated QR code customization.

### Technical Details
- **Implementation**: TypeScript plugin interface with Python backend scripts
- **Dependencies**: Python 3.8+, qrcode[pil], pillow, pyzbar, opencv-python, numpy
- **Security**: Input validation, secure file handling, safe parameter passing
- **Channel Support**: Full compatibility with additional web interface optimizations

### Features
- All AgentSkill features plus:
- Logo embedding (PNG, JPG, GIF with transparency support)
- Gradient color support
- Enhanced QR code decoding using OpenCV
- Custom QR code module shapes and patterns
- Adjustable error correction levels (L/M/Q/H)
- Batch processing capabilities
- Base64 encoding support for web interfaces
- High-resolution SVG output for print media

### Requirements
- Python 3.8 or higher
- Required Python packages:
  ```bash
  pip install qrcode[pil] pillow pyzbar opencv-python numpy
  ```
- Write access to temporary directories
- Sufficient system resources for image processing

### Installation
Install via OpenClaw plugin manager or manual setup following the PLUGIN/README.md instructions.

### Best For
- Enterprise users requiring brand-compliant QR codes
- Marketing campaigns needing custom logos and colors
- High-volume QR code processing
- Applications requiring enhanced decoding accuracy
- Print media requiring high-resolution output

## Migration Between Modes

### AgentSkill → Plugin
- All existing commands continue to work
- Additional advanced parameters become available
- Requires Python environment setup

### Plugin → AgentSkill  
- Advanced features (logo, gradients) will not be available
- Basic functionality remains identical
- No Python dependencies required

## Performance Considerations

### AgentSkill Mode
- Faster startup (no Python initialization)
- Lower memory usage
- Suitable for resource-constrained environments

### Plugin Mode
- Higher memory usage due to Python processes
- Slower initial startup (Python interpreter loading)
- Better performance for batch operations and complex image processing

## Maintenance

Both modes are maintained in the same repository to ensure feature parity where possible. Security fixes and core improvements are applied to both implementations.