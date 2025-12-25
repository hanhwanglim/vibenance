FROM oven/bun:1-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

FROM base AS prepare
RUN bun add -g turbo
COPY . .
RUN turbo prune server web --docker

FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN bun install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
RUN bun x turbo run build --filter=web --filter=server

FROM base AS runner
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/server/node_modules /app/apps/server/node_modules
COPY --from=builder /app/apps/server/dist /app/apps/server/dist
COPY --from=builder /app/apps/web/dist /app/apps/web/dist

COPY --from=builder /app/packages/db /app/packages/db
COPY --from=builder /app/packages/config /app/packages/config

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER bun
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "run", "apps/server/dist/index.mjs"]
