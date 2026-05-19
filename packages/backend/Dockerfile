FROM node:20-alpine

RUN apk add --no-cache openssl openssl-dev libcrypto3

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

RUN npm install

COPY packages/backend/tsconfig.json packages/backend/
COPY packages/backend/prisma packages/backend/prisma/
COPY packages/backend/src packages/backend/src/

WORKDIR /app/packages/backend

RUN npx prisma generate

EXPOSE 3000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]
