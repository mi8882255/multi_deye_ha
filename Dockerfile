ARG BUILD_FROM=node:20-alpine
FROM ${BUILD_FROM}

RUN apk add --no-cache nodejs npm || true

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Remove dev dependencies and source after build
RUN npm prune --omit=dev && rm -rf src tsconfig.json

CMD ["node", "dist/ha-addon/addon.js"]
