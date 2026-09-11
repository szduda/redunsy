#!/usr/bin/env bash
# Per-boot reconciliation for Redunsy: make sure the local PostgreSQL that
# install.sh provisioned is running before the dev server terminal starts.
set -euo pipefail

CLUSTER="main"

PGVER="$(ls -1 /usr/lib/postgresql 2>/dev/null | sort -n | tail -1)"
if [ -z "${PGVER}" ]; then
  echo "PostgreSQL is not installed; run .cursor/install.sh first" >&2
  exit 0
fi

if ! pg_lsclusters -h "${PGVER}" "${CLUSTER}" 2>/dev/null | grep -q online; then
  sudo pg_ctlcluster "${PGVER}" "${CLUSTER}" start || true
fi

for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    echo "PostgreSQL ${PGVER}/${CLUSTER} is ready"
    exit 0
  fi
  sleep 1
done

echo "PostgreSQL did not become ready in time" >&2
exit 1
