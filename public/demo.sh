#!/usr/bin/env bash
# Define once, cite everywhere — the refund-fork demo (verified against @prodshape/cli@%PRODSHAPE_VERSION%)
set -eu

# Non-governed sandbox: runs in a throwaway temp directory, installs locally,
# re-runnable as often as you like. No global install, no git.
cd "$(mktemp -d)"
npm init -y >/dev/null 2>&1
npm install --save-dev --save-exact @prodshape/cli@%PRODSHAPE_VERSION%
prodshape() { npx --no-install prodshape "$@"; }

mkdir -p docs/product/model/business-rules openspec/specs/checkout openspec/specs/billing openspec/specs/support

# ── ACT 1: what an SDD repo looks like after a few weeks ─────────────
# The same rule, restated by agents in three specs, three wordings.
cat > openspec/specs/checkout/spec.md <<'EOF'
# Checkout

## Returns
Customers can request a refund within 30 days of delivery.
EOF
cat > openspec/specs/billing/spec.md <<'EOF'
# Billing

## Credits
Refunds are issued for purchases made in the last 30 days.
EOF
cat > openspec/specs/support/spec.md <<'EOF'
# Support playbook

## Refunds
If the order is less than a month old, offer a refund.
EOF

grep -rn -i "refund" openspec/specs
# billing:  "purchases made in the last 30 days"   <- from PURCHASE
# checkout: "within 30 days of delivery"           <- from DELIVERY
# support:  "less than a month old"                <- neither
# Nobody decided that fork. Paraphrase did.

# ── ACT 2: define once, cite everywhere ──────────────────────────────
cat > docs/product/model/business-rules/br-refund-001.md <<'EOF'
---
id: BR-REFUND-001
type: business-rule
title: Refund window
status: active
---

## Rule

Refunds are accepted within 30 days of delivery.

## Rationale

Customers need a predictable window; finance needs a bounded liability.

## Examples

A delivery on March 1 may be refunded through March 31.

## Exceptions

None.
EOF

CITE=$(prodshape cite --id BR-REFUND-001 \
  --file docs/product/model/business-rules/br-refund-001.md --form inline)

cat > openspec/specs/checkout/spec.md <<EOF
# Checkout

## Returns
Refunds follow BR-REFUND-001. $CITE
EOF
cat > openspec/specs/billing/spec.md <<EOF
# Billing

## Credits
Refund eligibility is BR-REFUND-001. $CITE
EOF
cat > openspec/specs/support/spec.md <<EOF
# Support playbook

## Refunds
Apply BR-REFUND-001 as written. $CITE
EOF

prodshape citations verify
# current  BR-REFUND-001  openspec/specs/billing/spec.md:4
# current  BR-REFUND-001  openspec/specs/checkout/spec.md:4
# current  BR-REFUND-001  openspec/specs/support/spec.md:4

# ── ACT 3: the rule changes (sandbox shortcut: a direct edit; a governed repository uses a Product Change) ─────────────────
node --input-type=module -e "
  import { readFileSync, writeFileSync } from 'node:fs';
  const p = 'docs/product/model/business-rules/br-refund-001.md';
  writeFileSync(p, readFileSync(p,'utf8').replace('30 days','14 days'));
"

prodshape citations verify
# stale  BR-REFUND-001  openspec/specs/billing/spec.md:4
# stale  BR-REFUND-001  openspec/specs/checkout/spec.md:4
# stale  BR-REFUND-001  openspec/specs/support/spec.md:4
# Every spec that cites the rule, flagged with file:line. No grep.
