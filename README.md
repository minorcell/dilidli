# 🎬 DILIDILI - 哔哩哔哩视频下载器

一个现代化的哔哩哔哩视频下载器，支持高质量视频下载、音视频自动合并、格式转换等功能。

![DILIDILI](https://img.shields.io/badge/Platform-Desktop-blue) ![Tauri](https://img.shields.io/badge/Framework-Tauri-orange) ![React](https://img.shields.io/badge/Frontend-React-61DAFB) ![Rust](https://img.shields.io/badge/Backend-Rust-orange)

## ✨ 功能特性

### 🚀 核心功能
- **🎥 高质量视频下载** - 支持最高4K分辨率
- **🔊 音视频自动合并** - 使用FFmpeg自动合并音视频流
- **🔐 登录认证** - 支持二维码登录，获取会员权限
- **📱 多格式支持** - 支持各种哔哩哔哩链接格式

### 🛠️ 高级功能
- **📁 文件导出** - 选择目标文件夹导出视频
- **🔄 格式转换** - 支持MP4、AVI、MKV格式转换
- **🎵 音频提取** - 提取MP3、AAC、WAV音频
- **📊 下载管理** - 实时进度显示和队列管理
  
## 🏗️ 技术架构

- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Rust + Tauri 2.0
- **音视频处理**: FFmpeg
- **状态管理**: Zustand
- **构建工具**: Vite + pnpm

## 📦 安装使用

### 系统要求
- macOS 10.15+ / Windows 10+ / Linux
- Node.js 18+
- Rust 1.70+
- pnpm

### 开发环境搭建

1. **克隆项目**
```bash
git clone https://github.com/minorcell/DILIDILI.git
cd DILIDILI
```

2. **安装依赖**
```bash
# 安装前端依赖
pnpm install

# 安装Rust依赖（自动）
cd src-tauri
cargo build
```

3. **启动开发服务器**
```bash
pnpm tauri dev
```

### 生产构建

```bash
pnpm tauri build
```

## 🎯 使用方法

1. **登录账号**
   - 点击登录按钮
   - 使用手机扫描二维码
   - 在手机上确认登录

2. **下载视频**
   - 复制哔哩哔哩视频链接
   - 粘贴到输入框中
   - 选择视频质量
   - 开始下载

3. **管理文件**
   - 选择导出文件夹
   - 转换视频格式
   - 提取音频文件

## 🔧 配置说明

### FFmpeg配置
项目已内置FFmpeg可执行文件，位于`resources/ffmpeg`。如果需要使用系统FFmpeg：

```bash
brew install ffmpeg  # macOS
```

### 开发配置
- 修改`src-tauri/tauri.conf.json`调整应用配置
- 修改`vite.config.ts`调整开发服务器配置

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ⚠️ 免责声明

本工具仅供个人学习和研究使用，请遵守相关法律法规和哔哩哔哩的使用条款。下载的内容仅限个人使用，禁止用于商业用途。

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台应用框架
- [React](https://reactjs.org/) - 用户界面库
- [FFmpeg](https://ffmpeg.org/) - 音视频处理工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

---

<div align="center">

**如果这个项目对您有帮助，请给一个 ⭐ 星标支持！**

Made with ❤️ by [minorcell](https://github.com/minorcell)

</div>
