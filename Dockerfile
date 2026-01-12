# Dockerfile para Controle Financeiro Uber
# Multi-stage build para otimizar tamanho da imagem

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Instalar dependências do sistema necessárias (incluindo build tools)
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Copiar arquivos de dependências
COPY package.json ./
COPY package-lock.json* ./
# Instalar dependências (fallback para npm install se npm ci falhar)
RUN npm ci || npm install

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar dependências do sistema para build (incluindo build tools)
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar Prisma Client (usa DATABASE_URL fake se não estiver definida)
ENV DATABASE_URL="postgresql://fake:fake@fake:5432/fake?schema=public"
RUN npx prisma generate

# Build da aplicação Next.js (sem gerar Prisma novamente)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Usar next build diretamente, já que Prisma foi gerado acima
RUN npx next build

# Stage 3: Runner (produção)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar openssl para Prisma
RUN apk add --no-cache openssl

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do standalone build
COPY --from=builder /app/public ./public

# Copiar standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma files necessários
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copiar package.json para scripts do Prisma (se necessário)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Ajustar permissões
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
