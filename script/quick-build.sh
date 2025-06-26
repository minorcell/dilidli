#!/bin/bash

# 快速构建脚本 - 仅构建不打包 DMG

echo "🚀 开始快速构建 CiliCili..."

# 清理
echo "📦 清理旧的构建文件..."
rm -rf target/release/bundle

# 构建
echo "🔨 构建应用..."
npm run tauri build

# 检查结果
if [ -d "target/release/bundle/macos" ]; then
    APP_PATH=$(find target/release/bundle/macos -name "*.app" -type d | head -n 1)
    if [ -n "$APP_PATH" ]; then
        echo "✅ 构建成功: $APP_PATH"
        echo "🎯 可以直接运行应用进行测试"
        
        # 询问是否打开应用
        read -p "是否立即打开应用进行测试？(y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$APP_PATH"
        fi
    else
        echo "❌ 构建失败：未找到 .app 文件"
        exit 1
    fi
else
    echo "❌ 构建失败：未找到构建目录"
    exit 1
fi

echo "🎉 快速构建完成！" 