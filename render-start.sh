#!/bin/sh
echo "[machy] Starting deployment..."
cd packages/backend
npx prisma migrate deploy
npx prisma db seed
echo "[machy] Seed completed. Starting server..."
exec node dist/server.js
