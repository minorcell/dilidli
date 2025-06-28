#!/bin/bash

# 快速构建脚本 - 仅构建不打包 DMG

echo "🚀 开始快速构建 DILIDILI..."

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="DILIDILI"

# 清理
echo "📦 清理旧的构建文件..."
rm -rf "$PROJECT_DIR/src-tauri/target/release/bundle"
rm -rf "${PROJECT_DIR}/${APP_NAME}.app"

# 构建
echo "🔨 构建应用..."
cd "$PROJECT_DIR"
npm run tauri build

# 检查结果
if [ -d "$PROJECT_DIR/src-tauri/target/release/bundle/macos" ]; then
    APP_PATH=$(find "$PROJECT_DIR/src-tauri/target/release/bundle/macos" -name "*.app" -type d | head -n 1)
    if [ -n "$APP_PATH" ]; then
        APP_BUNDLE_NAME=$(basename "$APP_PATH")
        echo "✅ 构建成功: $APP_PATH"
        
        # 复制到根目录
        echo "📂 复制应用到根目录..."
        cp -R "$APP_PATH" "$PROJECT_DIR/"
        echo "✅ 应用已复制到: ${PROJECT_DIR}/${APP_BUNDLE_NAME}"
        
        echo "🎯 可以直接运行应用进行测试"
        echo "📍 应用位置: ${APP_BUNDLE_NAME}"
    else
        echo "❌ 构建失败：未找到 .app 文件"
        exit 1
    fi
else
    echo "❌ 构建失败：未找到构建目录"
    exit 1
fi

echo "🎉 快速构建完成！" 