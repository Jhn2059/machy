#!/bin/sh
set -e

echo "[machy-api] Running migrations..."
npx prisma migrate deploy || echo "[machy-api] Migrations skipped (already applied)"

echo "[machy-api] Running seed..."
npx prisma db seed || echo "[machy-api] Seed skipped"

echo "[machy-api] Starting server..."
exec npx ts-node-dev --respawn --transpile-only src/server.ts
