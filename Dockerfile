# syntax=docker/dockerfile:1

# ---- Base image ----
FROM node:20-alpine AS base
# libc6-compat is required by some Node.js native modules on Alpine
RUN apk add --no-cache libc6-compat

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
# build toolchain for native modules (bcrypt)
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Next.js auto-loads .env / .env.production from the build context, so
# NEXT_PUBLIC_* values are inlined into the client bundle here.
RUN npm run build

# ---- Runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output bundles only the server + traced node_modules
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Env files are read at runtime as well (DB host is overridden via compose)
COPY --from=builder --chown=nextjs:nodejs /app/.env* ./

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
