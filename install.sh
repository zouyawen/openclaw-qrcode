#!/bin/bash
set -e

echo "🚀 Installing OpenClaw QR Code Plugin..."
echo "========================================"

# 检查 OpenClaw 是否已安装
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw not found. Please install OpenClaw first."
    exit 1
fi

# 创建目录
mkdir -p ~/.openclaw/plugins/qr-code-plugin
mkdir -p ~/.openclaw/skills/qr-code

echo "📥 Downloading plugin from ClawHub..."

# 下载插件
curl -L https://clawhub.ai/zouyawen/openclaw-qr-code/download/plugin.zip -o /tmp/qr-code-plugin.zip
unzip -o /tmp/qr-code-plugin.zip -d ~/.openclaw/plugins/qr-code-plugin/
rm /tmp/qr-code-plugin.zip

# 下载技能
curl -L https://clawhub.ai/zouyawen/openclaw-qr-code/download/skill.zip -o /tmp/qr-code-skill.zip  
unzip -o /tmp/qr-code-skill.zip -d /tmp/qr-code-skill/
cp /tmp/qr-code-skill/AGENTSKILL/qr-code/SKILL.md ~/.openclaw/skills/qr-code/
rm -rf /tmp/qr-code-skill /tmp/qr-code-skill.zip

echo "🐍 Installing Python dependencies..."
pip3 install qrcode[pil] pillow numpy pyzbar

echo "⚙️  Configuring plugin..."
cat > /tmp/qr-plugin-config.json << EOF
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
EOF

# 合并配置
if [ -f ~/.openclaw/openclaw.json ]; then
    # 如果配置文件存在，合并插件配置
    node -e "
    const fs = require('fs');
    const current = JSON.parse(fs.readFileSync('~/.openclaw/openclaw.json', 'utf8'));
    const plugin = JSON.parse(fs.readFileSync('/tmp/qr-plugin-config.json', 'utf8'));
    current.plugins = current.plugins || {};
    current.plugins.entries = current.plugins.entries || {};
    current.plugins.entries['qr-code'] = plugin.plugins.entries['qr-code'];
    fs.writeFileSync('~/.openclaw/openclaw.json', JSON.stringify(current, null, 2));
    " 2>/dev/null || echo "⚠️  Manual config merge needed"
else
    cp /tmp/qr-plugin-config.json ~/.openclaw/openclaw.json
fi
rm /tmp/qr-plugin-config.json

echo "🔄 Restarting OpenClaw..."
openclaw gateway restart

echo ""
echo "✅ Installation complete!"
echo ""
echo "🎨 Try it out:"
echo "   '帮我生成一个圆点的渐变色二维码'"
echo ""
echo "📁 Files location:"
echo "   QR codes: ~/clawd/qr-codes/"
echo "   Logos:    ~/clawd/qr-assets/"