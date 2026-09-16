FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS production-dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    DATABASE_PATH=/project/aci-platform.sqlite \
    HOST=0.0.0.0 \
    PORT=8080
WORKDIR /app
RUN mkdir -p /project && chown -R node:node /app /project
COPY --from=build /app/dist ./dist
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY docker/entrypoint.sh /usr/local/bin/aci-customer-assistant-entrypoint
RUN chmod 755 /usr/local/bin/aci-customer-assistant-entrypoint && chown -R node:node /app /project
USER node
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/aci-customer-assistant-entrypoint"]
