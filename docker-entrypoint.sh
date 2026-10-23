#!/bin/sh
set -e

# 1. Wait until the database accepts TCP connections (30 tries, 2s apart)
echo "Waiting for database..."
i=0
until node -e "
const net = require('net');
const u = new URL(process.env.DATABASE_URL);
const s = net.connect({ host: u.hostname, port: Number(u.port) || 5432 });
s.on('connect', () => { s.end(); process.exit(0); });
s.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 1500);
"; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "Database not reachable after 30 attempts, giving up."
    exit 1
  fi
  echo "  database not ready (attempt $i/30), retrying in 2s..."
  sleep 2
done
echo "Database is up."

# 2. Apply migrations
echo "Running migrations..."
prisma migrate deploy

# 3. Seed (idempotent)
echo "Seeding..."
node prisma/seed.js

# 4. Start the app. HOSTNAME must be reset because Docker overrides it with the container id.
echo "Starting Gaarizo on port ${PORT:-3000}..."
HOSTNAME=0.0.0.0 exec node server.js
