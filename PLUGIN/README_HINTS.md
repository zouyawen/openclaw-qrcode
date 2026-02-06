## 📁 Smart Directory Hints

The plugin now provides intelligent directory hints to guide users:

### **For QR Code Generation**
- Shows the configured output directory in a user-friendly format
- Uses `~` for home directory to protect privacy
- Provides relative paths when possible

### **For Logo/Asset Upload**
- Shows the configured assets directory 
- Provides clear instructions for file placement
- Supports both direct file paths and directory guidance

### **Privacy Protection**
- Never exposes full absolute paths with usernames
- Converts `/Users/username/...` to `~/...`
- Uses workspace-relative paths when possible

### **Example Messages**

**Web Channel - Generation:**
```
## 📱 QR Code Generated Successfully!

📁 **Output Directory**: ~/Documents/qr-codes/
📄 **File Saved**: qr_https-www-mzt315-com_2026-02-05.png

💡 **Need Base64?** Reply with "base64" for web embedding.
```

**Web Channel - Logo Upload Guidance:**
```
## 🖼️ Add Logo to Your QR Code

📁 **Assets Directory**: ~/Documents/qr-assets/
📤 **Place your logo file** in this directory, then provide the filename.

📋 **Example**: If you place "logo.png" in the assets directory, 
just say "use logo.png" or provide the full path "~/Documents/qr-assets/logo.png".
```