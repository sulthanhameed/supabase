#!/usr/bin/env bash
# Build Command for Render / Railway / any Node host:   bash build.sh   (or: npm run build)
set -euo pipefail
cd "$(dirname "$0")"
echo "▶ Installing backend dependencies (node $(node -v))"
if [ -f package-lock.json ]; then
  npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund
else
  npm install --omit=dev --no-audit --no-fund
fi
echo "✓ Backend build complete"
