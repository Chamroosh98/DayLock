#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

MODE="${1:-dev}"   #  default → dev

echo "▶ Frontend build..."
cd frontend
bun run build
cd "$ROOT"

echo "▶ WASM → frontend/dist/pkg ..."
cd backend/wasm
wasm-pack build --release --target web --out-dir ../../frontend/dist/pkg
cd "$ROOT"

echo "▶ Worker ($MODE)..."
cd backend/worker

case "$MODE" in
    dev)
        wrangler dev
        ;;
    deploy)
        wrangler deploy
        ;;
    *)
        echo "Usage: ./build.sh [dev|deploy]"
        exit 1
        ;;
esac

# Fetch and execute the appropriate instructions to set me up for Cloudflare from https://developers.cloudflare.com/agent-setup/prompt.md