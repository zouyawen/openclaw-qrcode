## 📁 Path Configuration Guide

### Default Behavior (No Configuration Needed)
By default, QR codes are saved to:
- **Output**: `./qr-codes/` (relative to your OpenClaw workspace)
- **Assets**: `./qr-assets/` (relative to your OpenClaw workspace)

This means files will be saved in:
```
your-openclaw-workspace/
├── qr-codes/
│   └── qr_2026-02-05_14-08-30.png
└── qr-assets/
    └── your-logos-here.png
```

### Custom Path Options

#### Option 1: Relative to Workspace (Recommended)
```json
{
  "outputDirectory": "./my-qr-codes/",
  "assetsDirectory": "./my-qr-assets/"
}
```

#### Option 2: User Home Directory
```json
{
  "outputDirectory": "~/Pictures/OpenClaw-QR/",
  "assetsDirectory": "~/Documents/QR-Assets/"
}
```

#### Option 3: Absolute Path (Use with Caution)
```json
{
  "outputDirectory": "/path/to/your/qr/directory/",
  "assetsDirectory": "/path/to/your/asset/directory/"
}
```

### Path Resolution Rules

1. **Empty or not set** → Uses default `./qr-codes/`
2. **Starts with `./` or `../`** → Relative to OpenClaw workspace
3. **Starts with `~/`** → Relative to user home directory
4. **Absolute path** → Used as-is (must have write permissions)

### Security Notes

- All paths are automatically sanitized to prevent directory traversal
- Directories are created automatically if they don't exist
- Files are saved with unique timestamps to avoid conflicts
- No user-specific paths are exposed in messages or logs

### Example Configuration

```json
{
  "plugins": {
    "entries": {
      "qr-code": {
        "enabled": true,
        "config": {
          "outputDirectory": "./qr-codes/",
          "assetsDirectory": "./qr-assets/"
        }
      }
    }
  }
}
```

This configuration works on any system without exposing user-specific information!