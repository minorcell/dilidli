# 🚀 CiliCili 构建指南

本文档介绍如何构建和打包 CiliCili 应用。

## 📋 系统要求

### 基本环境
- **macOS**: 10.15+ (Catalina 或更高版本)
- **Node.js**: 18+ 
- **Rust**: 1.70+
- **pnpm**: 推荐包管理器

### 安装依赖工具

```bash
# 安装 Homebrew (如果未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node

# 安装 pnpm
npm install -g pnpm

# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 DMG 打包工具
brew install create-dmg
```

## 🛠️ 构建步骤

### 1. 克隆项目
```bash
git clone https://github.com/minorcell/cilicili.git
cd cilicili
```

### 2. 安装项目依赖
```bash
pnpm install
```

### 3. 构建方式选择

#### A. 快速构建 (仅构建应用，不打包 DMG)
```bash
./quick-build.sh
```
- 适用于开发测试
- 生成 `.app` 文件在 `target/release/bundle/macos/`
- 构建速度更快

#### B. 完整构建 (构建并打包成 DMG)
```bash
./build-dmg.sh
```
- 适用于正式发布
- 自动下载并包含 FFmpeg
- 生成可分发的 DMG 文件
- 包含代码签名选项

### 4. 手动构建 (如果脚本不可用)
```bash
# 构建应用
pnpm tauri build

# 找到生成的 .app 文件
find target/release/bundle/macos -name "*.app"
```

## 📦 构建输出

### 快速构建输出
```
target/release/bundle/macos/
└── CiliCili.app/          # 可执行的 macOS 应用
```

### 完整构建输出
```
CiliCili-1.0.0.dmg         # 可分发的 DMG 文件
target/release/bundle/macos/
└── CiliCili.app/          # 应用包
```

## 🔧 配置选项

### 修改应用信息
编辑 `src-tauri/tauri.conf.json`:
```json
{
  "productName": "CiliCili",
  "version": "1.0.0",
  "identifier": "com.minorcell.cilicili"
}
```

### 修改构建脚本设置
编辑 `build-dmg.sh`:
```bash
APP_NAME="CiliCili"
APP_VERSION="1.0.0"
BUNDLE_ID="com.minorcell.cilicili"
DEVELOPER_TEAM=""  # 填入开发者团队 ID 启用代码签名
```

## 🏗️ FFmpeg 集成

### 自动集成
构建脚本会自动处理 FFmpeg:
1. 检查 `resources/ffmpeg` 是否存在
2. 如果不存在，自动从 https://evermeet.cx 下载
3. 将 FFmpeg 复制到应用包的 Resources 目录

### 手动添加 FFmpeg
```bash
# 下载 FFmpeg
mkdir -p resources
cd resources
curl -L -o ffmpeg.zip "https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip"
unzip ffmpeg.zip
chmod +x ffmpeg
rm ffmpeg.zip
cd ..
```

## 🔐 代码签名

### 开发者证书签名
1. 获取 Apple Developer 账号
2. 安装开发者证书到钥匙串
3. 在 `build-dmg.sh` 中设置 `DEVELOPER_TEAM` 变量
4. 重新运行构建脚本

### 公证 (Notarization)
对于 macOS 10.15+ 分发，需要公证:
```bash
# 上传到 Apple 进行公证
xcrun altool --notarize-app \
  --primary-bundle-id "com.minorcell.cilicili" \
  --username "your-apple-id@example.com" \
  --password "app-specific-password" \
  --file "CiliCili-1.0.0.dmg"
```

## 🚨 故障排除

### 常见问题

#### 1. Rust 编译错误
```bash
# 更新 Rust 工具链
rustup update
```

#### 2. Node.js 版本问题
```bash
# 检查版本
node --version  # 应该是 18+
pnpm --version
```

#### 3. 权限问题
```bash
# 给脚本执行权限
chmod +x build-dmg.sh
chmod +x quick-build.sh
```

#### 4. FFmpeg 下载失败
```bash
# 手动下载并放置
curl -L -o resources/ffmpeg.zip "https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip"
cd resources && unzip ffmpeg.zip && chmod +x ffmpeg && rm ffmpeg.zip
```

#### 5. DMG 创建失败
```bash
# 安装 create-dmg
brew install create-dmg

# 清理之前的构建
rm -rf dmg-build CiliCili-*.dmg
```

### 构建日志
构建过程中的详细日志会显示在终端中，包括:
- 依赖检查结果
- 构建进度
- 错误信息
- 文件路径

## 📝 发布清单

发布前检查:
- [ ] 应用可以正常启动
- [ ] 登录功能正常
- [ ] 视频下载功能正常
- [ ] FFmpeg 音视频合并正常
- [ ] DMG 文件可以正常安装
- [ ] 代码已签名 (如果需要)
- [ ] 应用已公证 (如果需要)

## 🔗 相关链接

- [Tauri 官方文档](https://tauri.app/)
- [Apple 开发者文档](https://developer.apple.com/documentation/)
- [FFmpeg 官网](https://ffmpeg.org/)
- [create-dmg 项目](https://github.com/create-dmg/create-dmg)

---

如有问题，请查看构建日志或提交 Issue。 