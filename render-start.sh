#!/bin/sh
echo "[machy] DATABASE_URL=$DATABASE_URL"
echo "[machy] Starting..."
cd packages/backend
npx prisma migrate deploy
exec node dist/server.js
