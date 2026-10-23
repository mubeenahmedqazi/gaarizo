# syntax=docker/dockerfile:1

# ---------- Stage 1: install dependencies ----------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
# postinstall runs "prisma generate", so the schema must be present
RUN npm ci

# ---------- Stage 2: build (no database needed) ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build
# remember the exact Prisma CLI version used by the project
RUN node -p "require('./node_modules/prisma/package.json').version" > /prisma-version

# ---------- Stage 3: runtime ----------
FROM node:20-alpine AS runner
LABEL maintainer="Mubeen"
LABEL description="Gaarizo - Pakistan car marketplace (Next.js + Prisma + PostgreSQL)"
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Prisma CLI with the exact same version as the project (used for migrate deploy)
COPY --from=builder /prisma-version /tmp/prisma-version
RUN npm i -g prisma@$(cat /tmp/prisma-version) && rm /tmp/prisma-version

# Next.js standalone server + static assets + public files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema, migrations and seed.js
COPY --from=builder /app/prisma ./prisma

# Modules needed by seed.js / the Prisma client (merged into standalone node_modules)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && addgroup -S nodejs && adduser -S nextjs -G nodejs \
    && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
