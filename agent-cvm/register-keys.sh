#!/bin/bash
# Re-registers Phala's gateway signer and receipt key (24h attestationValidity) on every Assay the
# product reads: the Arbitrum Sepolia Assay on Paxos USDG. Every pass runs even if an earlier one
# fails; the job exits non-zero if any pass failed. Installed at ~/.local/share/chiron-keeper/register.sh
# (launchd cannot read ~/Desktop); ARB_RPC_URL in that directory's .env overrides the Arbitrum RPC.
set -uo pipefail
NODE=/Users/kamal/.nvm/versions/node/v24.9.0/bin/node
KEEP="$HOME/.local/share/chiron-keeper"
LOG="$KEEP/register.log"
cd "$KEEP/agent"
set -a; . "$KEEP/.env"; set +a
ASSAY=0x2C8B2587AC69BB7bB804ced9ebC2c08D0EEFB6c4
failed=0

pass() {
  local label=$1; shift
  echo "---- $label $(date -u '+%Y-%m-%d %H:%M:%S') UTC ----" >> "$LOG"
  env "$@" "$NODE" --env-file-if-exists=../.env --env-file-if-exists=.env src/index.ts register >> "$LOG" 2>&1
  local rc=$?
  echo "exit=$rc" >> "$LOG"
  [ "$rc" -eq 0 ] || failed=1
}

pass "Arbitrum Sepolia" CHAIN_ID=421614 RPC_URL="${ARB_RPC_URL:-https://sepolia-rollup.arbitrum.io/rpc}" ASSAY_ADDRESS=$ASSAY
echo "job exit=$failed" >> "$LOG"
exit $failed
