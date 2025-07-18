#!/bin/bash

# Custom build script to handle Rollup optional dependency issues
set -e

echo "🚀 Starting custom build process..."

# Remove existing node_modules and package-lock.json
echo "🧹 Cleaning up old dependencies..."
rm -rf node_modules package-lock.json

# Install dependencies with explicit platform support
echo "📦 Installing dependencies..."
npm install --verbose --no-audit

# Verify rollup installation
echo "🔍 Verifying Rollup installation..."
if ! npm list rollup > /dev/null 2>&1; then
    echo "⚠️  Rollup not found, installing explicitly..."
    npm install rollup@latest --save-dev
fi

# Run the actual build
echo "🏗️  Building the project..."
npm run build

echo "✅ Build completed successfully!" 