FROM node:20-alpine

WORKDIR /app

# Copy root workspace config
COPY package.json package-lock.json* ./

# Copy workspace packages' package.json
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install all dependencies at root
RUN npm install

# Copy source code
COPY packages/frontend/tsconfig.json packages/frontend/tsconfig.node.json packages/frontend/vite.config.ts packages/frontend/
COPY packages/frontend/index.html packages/frontend/
COPY packages/frontend/tailwind.config.js packages/frontend/postcss.config.js packages/frontend/
COPY packages/frontend/src packages/frontend/src/

WORKDIR /app/packages/frontend

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0"]
