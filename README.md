# OpenClaw QR Code Plugin 📱

![OpenClaw QR Code](https://img.shields.io/badge/OpenClaw-QR_Code-2ea44f)

**智能二维码生成插件** - 支持圆点样式、渐变色彩、Logo 集成，完全通过自然语言交互！

## 🚀 快速开始

### 一键安装（推荐）
```bash
# 安装完整功能
curl -s https://raw.githubusercontent.com/zouyawen/openclaw-qrcode/main/install.sh | bash

# 重启 OpenClaw
openclaw gateway restart
```

### 基础安装（仅基本功能）
```bash
# 从 ClawHub 安装技能
mkdir -p ~/.openclaw/skills/qr-code
curl -L https://clawhub.ai/zouyawen/openclaw-qr-code/download/skill.zip | tar -xz -C ~/.openclaw/skills/qr-code --strip=1
openclaw gateway restart
```

## 🎨 功能特性

### 🔮 智能自然语言
- "**帮我生成一个圆点的渐变色二维码**"
- "**在二维码中间加个 logo**"  
- "**用蓝色和黄色做渐变效果**"
- "**这个二维码图片里是什么内容？**"

### 🎯 高级视觉效果
- **圆点样式**: 现代化的圆角模块
- **点级渐变**: 每个点都有不同颜色
- **Logo 集成**: 自动居中，智能保护
- **自定义配色**: 支持任何 CSS 颜色

### 🔒 安全可靠
- 路径遍历防护
- 输入参数验证  
- 安全错误处理
- 高纠错级别确保扫描可靠性

## 📁 文件位置

| 文件类型 | 路径 |
|---------|------|
| 二维码输出 | `~/clawd/qr-codes/` |
| Logo 素材 | `~/clawd/qr-assets/` |

> 💡 **添加自己的 Logo**: 将 PNG/JPG 文件放入 `~/clawd/qr-assets/` 目录即可

## 🧪 使用示例

安装后，直接用自然语言对话：

- "**生成一个我的网站二维码**" → 会询问网址并生成
- "**让二维码看起来更现代**" → 自动应用圆点样式  
- "**添加渐变效果**" → 应用色彩渐变
- "**在中间放个 logo**" → 自动使用 `qr-assets/` 中的 logo

## 📦 仓库结构

```
openclaw-qrcode/
├── README.md                 # 这个文件
├── install.sh               # 一键安装脚本
├── LICENSE                  # MIT 许可证
├── PLUGIN/                  # 完整插件
│   ├── index.ts            # TypeScript 插件入口
│   ├── scripts/            # Python 高级功能脚本
│   └── openclaw.plugin.json
└── AGENTSKILL/             # 技能定义
    └── qr-code/
        └── SKILL.md       # 技能文档
```

## ❓ 常见问题

### Q: 安装后没有反应？
**A**: 确保已重启 OpenClaw (`openclaw gateway restart`)，并检查 Python 依赖是否安装成功。

### Q: Logo 不显示？
**A**: 确保 logo 文件放在 `~/clawd/qr-assets/` 目录，并且是 PNG/JPG 格式。

### Q: 如何卸载？
**A**: 删除相关目录并重启：
```bash
rm -rf ~/.openclaw/plugins/qr-code-plugin ~/.openclaw/skills/qr-code
openclaw gateway restart
```

## 🔗 资源链接

- **技能页面**: [ClawHub - openclaw-qr-code](https://clawhub.ai/zouyawen/openclaw-qr-code)
- **最新文档**: 查看此 README 获取最新信息

## 📜 许可证

MIT License