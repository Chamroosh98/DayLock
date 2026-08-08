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
GREY="\033[90m"

log_info()    { echo -e "   ${BLUE}ℹ️${RESET} $1"; }
log_step()    { echo -e "   ${CYAN}${BOLD}⚙️ $1${RESET}"; }
log_success() { echo -e "   ${GREEN}✅${RESET} $1"; }
log_warn()    { echo -e "   ${YELLOW}⚠️${RESET} $1"; }
log_error()   { echo -e "   ${RED}❌${RESET} $1"; }

run_quiet() {
    local desc="$1"
    shift
    log_info "$desc"
    local tmp ec=0
    tmp=$(mktemp)
    if "$@" >"$tmp" 2>&1; then
        ec=0
    else
        ec=$?
    fi
    while IFS= read -r line || [ -n "$line" ]; do
        printf "\t${GREY}%s${RESET}\n" "$line"
    done <"$tmp"
    rm -f "$tmp"
    return $ec
}


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
    log_info "Generate token at : https://dash.cloudflare.com/profile/api-tokens"
    echo ""
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

resolve_kv_id_from_list() {
    local NAME="$1"
    local LIST_OUT
    LIST_OUT=$(wrangler kv namespace list 2>&1) || true

    local ID
    ID=$(printf '%s' "$LIST_OUT" | bun -e '
        const name = process.argv[1];
        const raw = await Bun.stdin.text();
        const start = raw.indexOf("[");
        const end = raw.lastIndexOf("]") + 1;
        if (start < 0 || end <= start) process.exit(1);
        let data;
        try { data = JSON.parse(raw.slice(start, end)); }
        catch { process.exit(1); }
        const hit = data.find(x => x.title === name);
        if (!hit || !hit.id) process.exit(1);
        process.stdout.write(hit.id);
    ' "$NAME" 2>/dev/null) || true

    if [ -z "$ID" ]; then
        ID=$(printf '%s' "$LIST_OUT" | tr '{' '\n' | grep -F "$NAME" | grep -oE '[a-f0-9]{32}' | head -1 || true)
    fi
    printf '%s' "$ID"
}

create_or_find_kv() {
    local NAME="$1"
    local OUT ID

    log_info "KV namespace : ${NAME}" >&2

    ID=$(resolve_kv_id_from_list "$NAME" || true)
    if [ -n "$ID" ]; then
        log_warn "${NAME} already exists — reusing it." >&2
        log_success "${NAME} ID -> ${ID}" >&2
        printf '%s\n' "$ID"
        return 0
    fi

    log_info "Creating ${NAME} ..." >&2
    OUT=$(wrangler kv namespace create "$NAME" 2>&1) || true
    while IFS= read -r line; do
        [ -n "$line" ] && printf "\t${GREY}%s${RESET}\n" "$line" >&2
    done <<< "$OUT"

    ID=$(echo "$OUT" | grep -oE 'id = "[a-f0-9]+"' | head -1 | cut -d'"' -f2 || true)
    if [ -z "$ID" ]; then
        ID=$(echo "$OUT" | grep -oE '[a-f0-9]{32}' | head -1 || true)
    fi
    if [ -z "$ID" ]; then
        ID=$(resolve_kv_id_from_list "$NAME" || true)
    fi

    if [ -z "$ID" ]; then
        log_error "Could not resolve ID for ${NAME}" >&2
        log_info "create output : $OUT" >&2
        return 1
    fi

    log_success "Created ${NAME} ID -> ${ID}" >&2
    printf '%s\n' "$ID"
}

RATE_ID=$(create_or_find_kv "DAYLOCK_RATE_LIMIT_KV") || exit 1
PASTE_ID=$(create_or_find_kv "DAYLOCK_PASTE_KV") || exit 1

log_info "Generating wrangler.toml from wrangler.toml.example ..."
sed \
    -e "s/REPLACE_WITH_DAYLOCK_RATE_LIMIT_KV_ID/$RATE_ID/" \
    -e "s/REPLACE_WITH_DAYLOCK_PASTE_KV_ID/$PASTE_ID/" \
    wrangler.toml.example > wrangler.toml

log_success "wrangler.toml ready — deploy continues even if KVs already existed!"


# ── Step 4: Frontend Packaging  ──
cd "$ROOT"
log_step "Building Frontend Assets (Bun + Vite)"
cd frontend
run_quiet "Installing dependencies with Bun ..." bun install
run_quiet "Building production bundle with Vite ..." bun run build
log_success "Frontend assets built into -> frontend/dist."


# ── Step 5: WebAssembly Core Compilation ──
cd "$ROOT"
log_step "Compiling WebAssembly Core Module (Rust)"
log_info "Output directory: frontend/dist/pkg"
cd backend/wasm
run_quiet "Running wasm-pack build ..." \
    wasm-pack build --release --target web --out-dir ../../frontend/dist/pkg
log_success "WASM binary compiled and optimized successfully :)"


# ── Step 6: Edge Deployment ──
cd "$ROOT"
log_step "Deploying Application to Cloudflare Edge Network"
cd backend/worker
run_quiet "Executing wrangler deploy ..." wrangler deploy

log_step "Deployment Completed Successfully!"
log_success "DayLock service is now live on Cloudflare Workers."