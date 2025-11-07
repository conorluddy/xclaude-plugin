#!/bin/bash
set -e

echo "🔨 Building xc-plugin MCP servers..."

# Build all MCP servers
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building xc-compile..."
cd xc-compile && npm run build && cd ..

echo "🏗️  Building xc-interact..."
cd xc-interact && npm run build && cd ..

echo "🏗️  Building xc-build..."
cd xc-build && npm run build && cd ..

echo "🏗️  Building xc-ai-assist..."
cd xc-ai-assist && npm run build && cd ..

echo "🏗️  Building xc-setup..."
cd xc-setup && npm run build && cd ..

echo "🏗️  Building xc-testing..."
cd xc-testing && npm run build && cd ..

echo "🏗️  Building xc-meta..."
cd xc-meta && npm run build && cd ..

echo "🏗️  Building xc-hybrid..."
cd xc-hybrid && npm run build && cd ..

echo "✅ All MCP servers built successfully!"
echo ""
echo "📋 Available MCP servers:"
echo "  - xc-compile    (Ultra-minimal build - just xcode_build)"
echo "  - xc-interact   (Pure UI interaction)"
echo "  - xc-build      (Build validation)"
echo "  - xc-ai-assist  (AI UI automation)"
echo "  - xc-setup      (Environment setup)"
echo "  - xc-testing    (E2E testing)"
echo "  - xc-meta       (Project maintenance)"
echo "  - xc-hybrid     (Full toolkit)"
