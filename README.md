# qBittorrent 表格增强器

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/leeguooooo/qbittorrent-table-enhancer/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/leeguooooo/qbittorrent-table-enhancer.svg)](https://github.com/leeguooooo/qbittorrent-table-enhancer/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/leeguooooo/qbittorrent-table-enhancer.svg)](https://github.com/leeguooooo/qbittorrent-table-enhancer/issues)

一个用于增强 qBittorrent Web 界面的用户脚本，通过可视化控制面板轻松显示/隐藏表格中的隐藏列，让你更好地管理和监控种子下载信息。

## ✨ 功能特性

### 🎛️ 可视化控制面板
- **拖拽式界面**：可自由移动到屏幕任意位置
- **折叠/展开**：节省屏幕空间，需要时快速展开
- **暗色主题**：与 qBittorrent 原生界面完美融合
- **实时预览**：勾选即时生效，立即看到效果

### 📊 完整的隐藏列支持
脚本支持显示 qBittorrent 中的 **22个隐藏列**：

| 列名 | 描述 | 用途 |
|------|------|------|
| # | 优先级 | 种子下载优先级 |
| 总大小 | 种子文件的总大小 | 查看完整文件大小 |
| 完成于 | 种子完成时间 | 追踪下载完成历史 |
| Tracker | Tracker 服务器 | 查看种子来源 |
| 下载限制 | 下载速度限制 | 监控下载限速设置 |
| 上传限制 | 上传速度限制 | 监控上传限速设置 |
| 已下载 | 总下载量 | 查看累计下载数据 |
| 已上传 | 总上传量 | 查看累计上传数据 |
| 本次会话下载 | 本次会话下载量 | 本次启动后的下载量 |
| 本次会话上传 | 本次会话上传量 | 本次启动后的上传量 |
| 剩余 | 剩余下载量 | 还需下载的数据量 |
| 有效时间 | 种子活跃时间 | 种子运行总时长 |
| 保存路径 | 文件保存路径 | 查看文件存储位置 |
| 完成 | 已完成大小 | 已完成的数据量 |
| 比率限制 | 最大分享比率 | 自动停止上传的比率 |
| 最后完整可见 | 最后一次看到完整种子的时间 | 种子健康度指标 |
| 最后活动 | 最后活动时间 | 最后一次数据传输时间 |
| 可用性 | 种子可用性 | 种子的完整性指标 |
| 保存路径不完整 | 下载时的临时路径 | 下载中的临时存储位置 |
| 信息哈希值 v1 | BitTorrent v1 哈希值 | 种子的唯一标识符 |
| 信息哈希值 v2 | BitTorrent v2 哈希值 | 新版本种子标识符 |
| 下次重新汇报 | 下次向 Tracker 汇报的时间 | Tracker 通信时间表 |

### 🎯 批量操作
- **显示所有**：一键显示所有隐藏列
- **隐藏所有**：一键隐藏所有额外列
- **单独控制**：每个列都可以独立显示/隐藏

### ⌨️ 快捷键支持
- **Ctrl+Shift+Q**：快速打开/关闭控制面板
- **Ctrl+Shift+D**：显示调试信息（用于问题诊断）

## 🚀 安装步骤

### 1. 安装用户脚本管理器
选择以下任一管理器：
- **推荐**：[Tampermonkey](https://www.tampermonkey.net/) - 支持 Chrome、Firefox、Safari、Edge
- [Violentmonkey](https://violentmonkey.github.io/) - 开源替代方案
- [Greasemonkey](https://www.greasespot.net/) - Firefox 专用

### 2. 安装脚本
有两种安装方式：

#### 方式一：直接安装（推荐）
1. 点击以下链接直接安装：
   ```
   https://github.com/leeguooooo/qbittorrent-table-enhancer/raw/main/src/qbittorrent-table-enhancer.user.js
   ```
2. 用户脚本管理器会自动检测并询问是否安装
3. 点击"安装"确认

#### 方式二：手动安装
1. 下载 [`qbittorrent-table-enhancer.user.js`](src/qbittorrent-table-enhancer.user.js) 文件
2. 打开用户脚本管理器的管理面板
3. 点击"添加新脚本"或"+"按钮
4. 将文件内容复制粘贴到编辑器中
5. 保存脚本

## 📖 使用方法

### 基本使用
1. **自动启动**：访问 qBittorrent Web 界面，脚本会自动运行
2. **查看通知**：页面顶部会显示"qBittorrent表格增强器已启用！"的绿色通知
3. **打开控制面板**：按 `Ctrl+Shift+Q` 快捷键

### 控制面板操作
1. **单列控制**：勾选/取消勾选想要显示/隐藏的列
2. **批量操作**：
   - 点击"显示所有"按钮显示所有隐藏列
   - 点击"隐藏所有"按钮隐藏所有额外列
3. **面板管理**：
   - 拖拽标题栏移动面板位置
   - 点击"折叠"按钮最小化面板
   - 点击"×"按钮关闭面板

### 故障排除
如果遇到问题：
1. 按 `Ctrl+Shift+D` 查看调试信息
2. 打开浏览器控制台查看详细日志
3. 刷新页面重新加载脚本

## 🛠️ 技术细节

### 兼容性
- **qBittorrent**：支持所有现代版本的 qBittorrent Web UI
- **浏览器**：Chrome、Firefox、Safari、Edge 等现代浏览器
- **脚本管理器**：Tampermonkey、Violentmonkey、Greasemonkey

### 工作原理
1. **自动检测**：脚本检测页面是否为 qBittorrent Web 界面
2. **DOM 监控**：监控页面动态变化，确保在表格重新加载后仍然有效
3. **双重处理**：
   - 通过 CSS 类名控制表头显示
   - 通过列索引控制数据行显示
4. **状态同步**：控制面板状态与实际列显示状态实时同步

### 项目结构
```
qbittorrent-table-enhancer/
├── src/
│   └── qbittorrent-table-enhancer.user.js  # 主脚本文件
├── assets/                                  # 资源文件（图片等）
├── docs/                                   # 文档目录
├── package.json                            # 项目配置
└── README.md                               # 说明文档
```

## 🔧 开发与贡献

### 本地开发
1. Clone 项目：
   ```bash
   git clone https://github.com/leeguooooo/qbittorrent-table-enhancer.git
   cd qbittorrent-table-enhancer
   ```

2. 编辑脚本文件：
   ```bash
   # 编辑主脚本
   vim src/qbittorrent-table-enhancer.user.js
   ```

3. 测试脚本：
   - 在用户脚本管理器中导入修改后的脚本
   - 在 qBittorrent Web 界面中测试功能

### 贡献指南
欢迎提交 Issue 和 Pull Request！

1. **报告问题**：在 [Issues](https://github.com/leeguooooo/qbittorrent-table-enhancer/issues) 页面描述遇到的问题
2. **功能建议**：在 Issues 中提出新功能建议
3. **代码贡献**：
   - Fork 项目
   - 创建功能分支
   - 提交更改
   - 发起 Pull Request

## 📝 更新日志

### v1.1.0 (2025-01-22)
- ✅ 完整实现22个隐藏列的显示控制
- ✅ 添加可拖拽的控制面板界面
- ✅ 支持快捷键操作
- ✅ 修复表格内容显示问题
- ✅ 改进列索引处理逻辑
- ✅ 添加调试功能

### v1.0.0 (2025-01-22)
- 🎉 初始版本发布
- ✅ 基础表格增强功能

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

感谢所有为此项目做出贡献的开发者和用户！

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！

有问题或建议？欢迎在 [Issues](https://github.com/leeguooooo/qbittorrent-table-enhancer/issues) 中反馈。