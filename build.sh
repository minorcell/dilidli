#!/bin/bash

# DILIDILI 构建快捷方式
# 调用 script 目录下的构建脚本

SCRIPT_DIR="$(dirname "$0")/script"

if [ "$1" = "dmg" ] || [ "$1" = "release" ]; then
    echo "🚀 启动完整构建 (DMG)..."
    exec "$SCRIPT_DIR/build-dmg.sh"
elif [ "$1" = "quick" ] || [ "$1" = "dev" ]; then
    echo "⚡ 启动快速构建..."
    exec "$SCRIPT_DIR/quick-build.sh"
else
    echo "DILIDILI 构建工具"
    echo ""
    echo "用法:"
    echo "  ./build.sh dmg     # 完整构建并打包成 DMG"
    echo "  ./build.sh quick   # 快速构建 (仅生成 .app)"
    echo ""
    echo "别名:"
    echo "  ./build.sh release # 等同于 dmg"
    echo "  ./build.sh dev     # 等同于 quick"
    echo ""
    echo "示例:"
    echo "  ./build.sh dmg     # 构建发布版本"
    echo "  ./build.sh quick   # 快速开发测试"
fi 