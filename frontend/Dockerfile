# Multi-stage build untuk optimasi ukuran image
FROM node:18-alpine AS builder
WORKDIR /app

# Tambah gcompat agar binary glibc (mis. swc) dapat berjalan di Alpine
RUN apk add --no-cache gcompat

# Copy package files untuk memanfaatkan Docker layer caching
COPY package.json ./
# Copy package-lock.json jika ada, kalau tidak ada skip
COPY package-lock.json* ./

# Install all dependencies (termasuk devDependencies untuk build)
RUN npm ci

# Copy semua source code dan config files
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy file yang diperlukan dari builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership ke nextjs user
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]