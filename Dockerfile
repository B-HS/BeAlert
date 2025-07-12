FROM oven/bun:latest AS base
WORKDIR /app

COPY package.json tsconfig.json drizzle.config.ts ./
COPY db ./db
COPY middlewares ./middlewares
COPY pages ./pages
COPY routes ./routes
COPY services ./services
COPY assets ./assets
COPY scripts ./scripts
COPY main.ts ./

RUN bun install --production

RUN bun run build

FROM oven/bun:latest
WORKDIR /app

COPY --from=base /app/dist ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/db ./db
COPY .env .env

EXPOSE 3000
CMD ["bun", "run", "main.js"]
