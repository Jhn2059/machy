#!/bin/sh
echo "[machy] Starting..."
cd packages/backend
npx prisma migrate deploy
exec node dist/server.js
