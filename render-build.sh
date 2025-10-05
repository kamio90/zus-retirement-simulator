#!/bin/bash
set -e

echo "🔧 Setting up pnpm via corepack..."
corepack enable
corepack prepare pnpm@9.12.0 --activate

echo "📦 Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

echo "🏗️  Building web application..."
pnpm -F web build

echo "✅ Build complete!"
