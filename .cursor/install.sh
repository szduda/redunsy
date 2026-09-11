#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for Redunsy.
# Provisions a local PostgreSQL, installs Node dependencies, applies the Drizzle
# schema, and seeds the rhythm catalogue so the app runs end-to-end (build,
# static rhythm pages, and DB scripts all work).
set -euo pipefail

# Run from the repository root regardless of the caller's working directory.
cd "$(dirname "$0")/.."

DB_NAME="redunsy"
DB_USER="redunsy"
DB_PASS="redunsy"
CLUSTER="main"

echo "==> Ensuring PostgreSQL is installed"
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi

# Resolve the installed major version (e.g. 16) instead of hard-coding it.
PGVER="$(ls -1 /usr/lib/postgresql 2>/dev/null | sort -n | tail -1)"
if [ -z "${PGVER}" ]; then
  echo "PostgreSQL did not install correctly" >&2
  exit 1
fi

echo "==> Starting PostgreSQL ${PGVER}/${CLUSTER}"
if ! pg_lsclusters -h "${PGVER}" "${CLUSTER}" 2>/dev/null | grep -q online; then
  sudo pg_ctlcluster "${PGVER}" "${CLUSTER}" start || true
fi

echo "==> Waiting for PostgreSQL to accept connections"
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then break; fi
  sleep 1
done
sudo -u postgres pg_isready -q

echo "==> Ensuring role and database exist"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';"
fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

echo "==> Writing .env.local (if missing)"
if [ ! -f .env.local ]; then
  CONN="postgres://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}"
  cat > .env.local <<EOF
# Local development connection to the Postgres provisioned by .cursor/install.sh.
POSTGRES_URL=${CONN}
DATABASE_URL=${CONN}
EOF
fi

echo "==> Installing Node dependencies"
npm ci

echo "==> Applying database schema"
npm run db:push

echo "==> Seeding rhythm catalogue"
npm run db:seed

echo "==> Install complete"
