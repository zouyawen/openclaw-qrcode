# QR Code Skill Usage Examples

## Basic Generation
```
/qr generate https://mzt315.com
```
Generates a standard black QR code on white background in PNG format.

## Custom Colors
```
/qr generate https://mzt315.com color=red backgroundColor=white
```
Creates a red QR code on white background.

## WhatsApp Compatible
```
/qr generate https://mzt315.com color=green format=png
```
Generates a green QR code in PNG format (compatible with WhatsApp).

## With Logo (Security Validated)
```
/qr generate https://mzt315.com logoPath=/path/to/logo.png
```
Overlays your logo on the QR code. **Security Note**: Only files within the workspace directory are allowed to prevent path traversal attacks.

## Automatic SVG-to-PNG Conversion for WhatsApp
```
/qr generate https://mzt315.com format=svg
```
When used in WhatsApp, automatically converts SVG output to PNG format for compatibility.

## Decode QR Code
Attach a QR code image and use:
```
/qr decode
```
Extracts the content from the QR code image.

## Beautify Existing QR Code
Attach a QR code image and use:
```
/qr beautify color=blue backgroundColor=lightgray size=12
```
Enhances the existing QR code with new styling while preserving the original data.

## Cross-Channel Usage
This skill works identically across all OpenClaw channels:
- **WhatsApp**: Automatically uses PNG/JPG formats, converts SVG to PNG automatically
- **Telegram**: Supports all formats including SVG
- **Discord**: Optimized for web viewing
- **Web Chat**: Full feature support

## Security Features
- **Path Traversal Protection**: logoPath is validated to only allow files within the workspace
- **Input Sanitization**: All color, size, and format inputs are validated against safe values
- **Format Validation**: Ensures only supported formats are used
- **Error Handling**: Comprehensive try-catch blocks with user-friendly error messages

## Error Handling Examples
The skill provides clear error messages for:
- Missing required parameters
- Invalid format specifications (e.g., `format=exe` will be rejected)
- Invalid color values (only valid CSS colors accepted)
- Size out of range (must be between 1-50)
- WhatsApp compatibility issues
- File access problems (with security validation)
- Path traversal attempts (blocked automatically)