FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build
RUN npm prune --omit=dev && rm -rf src tsconfig.json

ENTRYPOINT []
CMD ["node", "dist/ha-addon/addon.js"]
