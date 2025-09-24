#!/bin/bash

set -e

# Configuration
PORT=8090

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/pocketbase"

echo "🚀 Starting PocketBase..."

# Check for clean option
if [ "$1" = "clean" ]; then
    echo "🧹 Clean mode requested - this will delete all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing pb_data directory..."
        rm -rf "$BACKEND_DIR/pb_data"
        echo "✅ Database cleaned"
    else
        echo "❌ Clean cancelled"
        exit 1
    fi
fi

# Load .env file
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "📋 Loading environment variables from .env"
    set -a  # automatically export all variables
    source "$PROJECT_ROOT/.env"
    set +a  # stop automatic export
else
    echo "⚠️  No .env file found in project root"
fi

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM_PATTERN="pocketbase_darwin_*"
    BIND_ADDR="localhost:$PORT"
    echo "📱 Detected macOS"
elif [[ "$OSTYPE" == "linux-"* ]]; then
    PLATFORM_PATTERN="pocketbase_linux_*"
    BIND_ADDR="0.0.0.0:$PORT"
    echo "🖥️  Detected Linux"
else
    echo "❌ Unsupported platform: $OSTYPE"
    exit 1
fi

# Find PocketBase binary
cd "$BACKEND_DIR"
POCKETBASE_BINARY=$(ls $PLATFORM_PATTERN 2>/dev/null | head -1)

if [ -z "$POCKETBASE_BINARY" ]; then
    echo "❌ PocketBase binary not found!"
    echo "   Run './scripts/setup-pocketbase.sh' first to download PocketBase"
    exit 1
fi

echo "✅ Found: $POCKETBASE_BINARY"
echo "🌐 Starting server on $BIND_ADDR"

# Start PocketBase
./"$POCKETBASE_BINARY" serve --http="$BIND_ADDR"
