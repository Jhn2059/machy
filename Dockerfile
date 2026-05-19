FROM node:20-alpine

RUN apk add --no-cache openssl

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
RUN npm run build

EXPOSE 10000

CMD npx prisma migrate deploy && node dist/server.js
