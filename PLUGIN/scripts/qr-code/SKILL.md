---
name: qr-code
description: Generate, decode, and beautify QR codes with various customization options. Use when user needs to create QR codes from text/URLs, extract data from QR code images, or apply visual enhancements like custom colors, logos, or styling. Supports both advanced Python-based features and basic Node.js fallback functionality.
---

# QR Code Skill

This skill provides comprehensive QR code functionality including generation, decoding, and beautification with advanced customization options.

## Quick Start

### Generate QR Code
```
Generate a QR code for "https://example.com" with red color and company logo
```

### Decode QR Code  
```
Extract data from this QR code image
```

### Beautify Existing QR Code
```
Make this QR code more visually appealing with our brand colors and logo
```

## 📤 File Upload Guide (Web Version)

Since OpenClaw webchat has limited media support, here are ways to work with images:

### Option 1: Direct File Upload
- Try dragging and dropping your QR code image into the chat
- If supported, the file path will be automatically detected

### Option 2: Base64 Data
- Convert your image to Base64 format
- Paste it as: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`

### Option 3: File Path
- Save your image to a known location
- Provide the full file path: `/path/to/your/qr-code.png`

### Option 4: Generated QR Codes
- When generating QR codes, they're saved to temporary files
- You can access them via the provided file paths
- Use terminal command: `open /path/to/generated/qr.png`

## Requirements

### Python (Recommended - Full Feature Set)
- **Python 3.8+**
- **Required packages:**
  ```bash
  pip install qrcode[pil] pillow pyzbar opencv-python numpy
  ```

### Node.js (Fallback - Basic Generation Only)
- Available automatically if Python is not installed
- Limited to basic QR code generation only
- No decode or beautify functionality

## Features

### 🎨 Generation
- Text/URL to QR code conversion
- Custom colors (foreground/background)
- Adjustable size and error correction levels
- Multiple output formats (PNG, JPG, SVG)

### 🔍 Decoding  
- Extract data from QR code images
- Support for multiple image formats
- Batch processing capability

### ✨ Beautification
- Add custom logos to QR codes
- Apply gradient colors
- Custom shapes and patterns
- Brand-compliant styling

## Usage Examples

### Basic Generation
```python
# Input: "Hello World"
# Output: Standard black/white QR code
```

### Colored QR Code
```python
# Input: "https://yourwebsite.com"
# Options: {"color": "#FF6B35", "backgroundColor": "#F7F7F7"}
# Output: Orange QR code on light gray background
```

### QR Code with Logo
```python
# Input: "https://yourcompany.com"
# Options: {"logoPath": "/path/to/logo.png", "color": "#2D3436"}
# Output: QR code with embedded company logo
```

## Advanced Customization

### Color Options
- **Standard colors**: "red", "blue", "green", etc.
- **Hex colors**: "#FF6B35", "#2D3436", etc.
- **RGB tuples**: [255, 107, 53] (for Python scripts)

### Logo Requirements
- **Formats**: PNG, JPG, GIF (transparent background recommended)
- **Size**: Should be smaller than QR code modules
- **Position**: Automatically centered

### Output Formats
- **PNG**: Best for web and general use
- **JPG**: Smaller file size, no transparency
- **SVG**: Scalable vector format for print

## Error Handling

### Common Issues
- **Invalid input**: Ensure input text/URL is valid
- **Logo too large**: Reduce logo size relative to QR code
- **Low contrast**: Avoid similar foreground/background colors
- **Decoding failures**: Ensure QR code image is clear and well-lit

### Fallback Behavior
If Python is not available:
- Only basic generation works
- Limited color options
- No logo support
- No decode/beautify functionality

## Integration Notes

This skill integrates with the `qr_code_operations` plugin tool which automatically:
- Detects Python availability
- Routes requests to appropriate implementation
- Provides graceful degradation when Python is unavailable
- Handles temporary file management

## Performance Tips

- **For batch operations**: Process multiple QR codes in sequence
- **Large logos**: Resize before passing to avoid performance issues  
- **High resolution**: Use SVG format for print-quality output
- **Memory usage**: Temporary files are automatically cleaned up

## Security Considerations

- **Input validation**: All inputs are sanitized before processing
- **File access**: Only processes files from allowed directories
- **Command injection**: Python scripts use safe parameter passing
- **Temporary files**: Created in secure temporary directories

## Troubleshooting

### Python Installation Issues
```bash
# Check Python version
python3 --version

# Install required packages
pip install --upgrade pip
pip install qrcode[pil] pillow pyzbar opencv-python numpy
```

### Permission Errors
- Ensure write access to temporary directories
- On macOS, may need to grant Terminal full disk access for file operations

### Image Quality Issues
- Use high-resolution source images for decoding
- Ensure sufficient contrast in generated QR codes
- Test QR codes with multiple scanning apps

## References

- [QR Code Wikipedia](https://en.wikipedia.org/wiki/QR_code)
- [Python qrcode library](https://github.com/lincolnloop/python-qrcode)
- [Pillow documentation](https://pillow.readthedocs.io/)
- [pyzbar documentation](https://pypi.org/project/pyzbar/)