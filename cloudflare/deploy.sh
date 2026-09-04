#!/usr/bin/env bash
set -e

echo "=================================================="
echo "🐭 Study Mouse - Cloudflare Pages Deploy Script"
echo "=================================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT/web"

echo "1. Building frontend..."
npm run build

echo "2. Deploying to Cloudflare Pages (study-mouse)..."
npx wrangler pages deploy dist --project-name=study-mouse

echo "=================================================="
echo "✅ Deployment complete!"
echo "Check your Pages URL and update LIFF Endpoint URL:"
echo "https://developers.line.biz/console/"
echo "=================================================="
