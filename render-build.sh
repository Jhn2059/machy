#!/bin/sh
echo "[machy] Build starting..."
npm install
cd packages/backend
npx prisma generate
npx tsc
echo "[machy] Build complete"
