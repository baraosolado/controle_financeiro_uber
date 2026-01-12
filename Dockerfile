# Dockerfile para Controle Financeiro Uber
# Build multi-stage otimizado

# ============================================
# Stage 1: Instalar dependências
# ============================================
FROM node:18-alpine AS deps
WORKDIR /app

# Instalar ferramentas de build
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# ============================================
# Stage 2: Build da aplicação
# ============================================
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar ferramentas de build
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Copiar dependências instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Gerar Prisma Client (precisa de DATABASE_URL, mesmo que fake)
ENV DATABASE_URL="postgresql://fake:fake@fake:5432/fake?schema=public"
RUN npx prisma generate

# Build Next.js (com logs detalhados)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Fazer build e capturar saída (compatível com /bin/sh)
RUN set -e; \
    npx next build 2>&1 | tee build.log || BUILD_FAILED=1; \
    if [ -n "$BUILD_FAILED" ]; then \
        echo "=== ❌ BUILD FALHOU ==="; \
        echo "=== Logs completos do build ==="; \
        cat build.log; \
        echo "=== Verificando .next/trace ==="; \
        cat .next/trace 2>/dev/null || echo "Trace não disponível"; \
        echo "=== Listando arquivos .next ==="; \
        ls -la .next/ 2>/dev/null || echo "Diretório .next não existe"; \
        exit 1; \
    fi; \
    echo "=== ✅ Build completado ==="; \
    echo "=== Verificando se standalone foi gerado ==="; \
    if [ ! -d .next/standalone ]; then \
        echo "❌ ERRO: standalone não gerado!"; \
        echo "=== Conteúdo do diretório .next ==="; \
        ls -la .next/ 2>/dev/null || echo "Diretório .next não existe"; \
        exit 1; \
    fi; \
    echo "✅ Standalone gerado com sucesso!"

# ============================================
# Stage 3: Imagem de produção
# ============================================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar openssl (necessário para Prisma)
RUN apk add --no-cache openssl

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos públicos (diretório public agora existe no projeto)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copiar build standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma (necessário em runtime)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Usar usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Iniciar aplicação
CMD ["node", "server.js"]
