#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# --- Formatting & Colors ---
BOLD="\033[1m"
RESET="\033[0m"
GREEN="\033[32m"
BLUE="\033[34m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"

log_info()    { echo -e "   ${BLUE}ℹ️${RESET} $1"; }
log_step()    { echo -e "   ${CYAN}${BOLD}⚙️ $1${RESET}"; }
log_success() { echo -e "   ${GREEN}✅${RESET} $1"; }
log_warn()    { echo -e "   ${YELLOW}⚠️${RESET} $1"; }
log_error()   { echo -e "   ${RED}❌${RESET} $1"; }

# ── Step 1: Toolchain Validation ──
log_step "Checking prerequisites and toolchain ..."
MISSING_TOOLS=()
for tool in bun wrangler rustc wasm-pack; do
    if command -v "$tool" >/dev/null 2>&1; then
        log_info "Tool verified : $(printf '%-10s' "$tool") (${GREEN}OK${RESET})"
    else
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    log_error "Missing required tools : ${MISSING_TOOLS[*]}"
    log_info "Please install missing dependencies before proceeding."
    exit 1
fi

# ── Step 2: Cloudflare Authentication ──
log_step "Cloudflare Authentication Configuration"
echo "   Select authentication method :"
echo "      1) Browser Interactive Login (wrangler login)"
echo "      2) Cloudflare API Token (Recommended for CI/CD & Headless)"
read -r -p "   Choose option [1/2] (default: 1) : " AUTH_MODE
AUTH_MODE="${AUTH_MODE:-1}"

if [ "$AUTH_MODE" = "2" ]; then
    echo ""
    log_info "API Token permissions required: Workers Scripts Edit + Workers KV Storage Edit"
    log_info "Generate token at: https://dash.cloudflare.com/profile/api-tokens"
    echo ""
    # Secure silent input (-s) for token to prevent plaintext leakage in terminal logs
    read -r -p "   👀 Enter Cloudflare API Token : " CLOUDFLARE_API_TOKEN

    echo ""
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        log_error "API Token cannot be empty! Aborting deployment!"
        exit 1
    fi
    export CLOUDFLARE_API_TOKEN

    read -r -p "   Account ID (optional, press Enter to skip) : " CLOUDFLARE_ACCOUNT_ID
    if [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
        export CLOUDFLARE_ACCOUNT_ID
        log_info "Cloudflare Account ID set to : $CLOUDFLARE_ACCOUNT_ID"
    fi
    log_success "API Token injected securely into environment!"
else
    log_info "Initiating browser login via Wrangler ..."
    wrangler login
fi

cd backend/worker

if [ ! -f wrangler.toml.example ]; then
    log_error "wrangler.toml.example not found in backend/worker directory!"
    exit 1
fi

# ── Step 3: KV Namespace Resolution & Injection ──
log_step "Provisioning / Verifying KV Namespaces on Cloudflare"
log_info "Creating or retrieving KV namespace : RATE_LIMIT_KV"
RATE_OUT=$(wrangler kv namespace create RATE_LIMIT_KV 2>&1) || true

log_info "Creating or retrieving KV namespace : PASTE_KV"
PASTE_OUT=$(wrangler kv namespace create PASTE_KV 2>&1) || true

RATE_ID=$(echo "$RATE_OUT" | grep -oE 'id = "[a-f0-9]+"' | head -1 | cut -d'"' -f2 || true)
PASTE_ID=$(echo "$PASTE_OUT" | grep -oE 'id = "[a-f0-9]+"' | head -1 | cut -d'"' -f2 || true)

if [ -z "$RATE_ID" ]; then RATE_ID=$(echo "$RATE_OUT" | grep -oE '[a-f0-9]{32}' | head -1 || true); fi
if [ -z "$PASTE_ID" ]; then PASTE_ID=$(echo "$PASTE_OUT" | grep -oE '[a-f0-9]{32}' | head -1 || true); fi

if [ -z "$RATE_ID" ] || [ -z "$PASTE_ID" ]; then
    log_info "Resolving existing KV IDs via 'wrangler kv namespace list'..."
    LIST_OUT=$(wrangler kv namespace list 2>&1) || true
    if [ -z "$RATE_ID" ]; then
        RATE_ID=$(echo "$LIST_OUT" | grep -i RATE_LIMIT_KV | grep -oE '[a-f0-9]{32}' | head -1 || true)
    fi
    if [ -z "$PASTE_ID" ]; then
        PASTE_ID=$(echo "$LIST_OUT" | grep -i PASTE_KV | grep -oE '[a-f0-9]{32}' | head -1 || true)
    fi
fi

if [ -z "$RATE_ID" ] || [ -z "$PASTE_ID" ]; then
    log_error "Failed to resolve KV Namespace IDs."
    log_info  "RATE_LIMIT_KV Output   : $RATE_OUT"
    log_info  "PASTE_KV      Output   : $PASTE_OUT"
    exit 1
fi

log_success "KV Namespace RATE_LIMIT_KV ID  -> $RATE_ID"
log_success "KV Namespace PASTE_KV ID       -> $PASTE_ID"

log_info "Generating wrangler.toml from wrangler.toml.example ..."
sed \
    -e "s/REPLACE_WITH_RATE_LIMIT_KV_ID/$RATE_ID/" \
    -e "s/REPLACE_WITH_PASTE_KV_ID/$PASTE_ID/" \
    wrangler.toml.example > wrangler.toml

log_success "wrangler.toml successfully generated with dynamic KV IDs :)"

# ── Step 4: Frontend Packaging  ──
cd "$ROOT"
log_step "Building Frontend Assets (Bun + Vite)"
cd frontend
log_info "Installing dependencies with Bun ..."
bun install
log_info "Building production bundle with Vite ..."
bun run build
log_success "Frontend assets built into -> frontend/dist."

# ── Step 5: WebAssembly Core Compilation ──
cd "$ROOT"
log_step "Compiling WebAssembly Core Module (Rust)"
log_info "Output directory: frontend/dist/pkg"
cd backend/wasm
wasm-pack build --release --target web --out-dir ../../frontend/dist/pkg
log_success "WASM binary compiled and optimized successfully :)"


# ── Step 6: Edge Deployment ──
cd "$ROOT"
log_step "Deploying Application to Cloudflare Edge Network"
cd backend/worker
log_info "Executing wrangler deploy ..."
wrangler deploy

log_step "Deployment Completed Successfully!"
log_success "DayLock service is now live on Cloudflare Workers."