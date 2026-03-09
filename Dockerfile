ARG BUILD_FROM
FROM ${BUILD_FROM}

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Remove dev dependencies and source after build
RUN npm prune --omit=dev && rm -rf src tsconfig.json

# s6-overlay service directory
COPY run.sh /etc/services.d/deye/run
RUN chmod +x /etc/services.d/deye/run
