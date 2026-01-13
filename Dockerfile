# ============================================
# Dockerfile Production-Ready
# Next.js 14 + Prisma + PostgreSQL
# Multi-stage build otimizado para produção
# ============================================

# ============================================
# Stage 1: Dependencies
# Instala apenas as dependências (otimiza cache do Docker)
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Instalar ferramentas de build necessárias para dependências nativas
# libc6-compat: compatibilidade com bibliotecas que precisam de glibc
# openssl: necessário para algumas dependências e Prisma
# python3, make, g++: necessários para compilar dependências nativas
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    python3 \
    make \
    g++

# Copiar apenas arquivos de dependências (melhora cache do Docker)
# Se package.json não mudar, esta etapa usa cache
COPY package.json package-lock.json* ./

# Instalar dependências
# npm ci: instalação determinística (mais rápido e confiável que npm install)
# --legacy-peer-deps: resolve conflitos de peer dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# ============================================
# Stage 2: Builder
# Compila a aplicação Next.js
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar ferramentas de build
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    python3 \
    make \
    g++

# Copiar dependências do stage anterior (não precisa reinstalar)
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Gerar Prisma Client
# DATABASE_URL fake é necessário apenas para gerar o client
# O Prisma não precisa de conexão real durante o build
# O client gerado será usado em runtime com DATABASE_URL real
ENV DATABASE_URL="postgresql://fake:fake@fake:5432/fake?schema=public"
RUN npx prisma generate

# Variáveis de ambiente para build (Build Args)
# NEXT_PUBLIC_* são injetadas no build time e ficam no bundle JavaScript
# Estas variáveis devem ser passadas como --build-arg no EasyPanel
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DEV_EMAIL_1
ARG NEXT_PUBLIC_DEV_EMAIL_2
ARG NEXT_PUBLIC_DEV_EMAIL_3

# Converter Build Args em Environment Variables
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_DEV_EMAIL_1=${NEXT_PUBLIC_DEV_EMAIL_1}
ENV NEXT_PUBLIC_DEV_EMAIL_2=${NEXT_PUBLIC_DEV_EMAIL_2}
ENV NEXT_PUBLIC_DEV_EMAIL_3=${NEXT_PUBLIC_DEV_EMAIL_3}

# Build Next.js em modo produção
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js
# Usando abordagem mais simples e robusta
RUN npx next build || ( \
    echo "=== ❌ BUILD FALHOU ===" && \
    echo "=== Verificando .next/trace ===" && \
    cat .next/trace 2>/dev/null || echo "Trace não disponível" && \
    echo "=== Listando arquivos .next ===" && \
    ls -la .next/ 2>/dev/null || echo "Diretório .next não existe" && \
    exit 1 \
)

# Verificar se standalone foi gerado
RUN if [ ! -d .next/standalone ]; then \
    echo "❌ ERRO: standalone não gerado!" && \
    echo "=== Conteúdo do diretório .next ===" && \
    ls -la .next/ 2>/dev/null || echo "Diretório .next não existe" && \
    exit 1; \
fi && \
echo "✅ Standalone gerado com sucesso!"

# ============================================
# Stage 3: Runner (Produção)
# Imagem final otimizada apenas com runtime
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar apenas openssl (necessário para Prisma em runtime)
# Não precisamos de python3, make, g++ aqui (apenas para build)
RUN apk add --no-cache openssl

# Criar usuário não-root para segurança
# Reduz superfície de ataque se container for comprometido
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos públicos (imagens, favicon, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copiar build standalone do Next.js
# O output standalone contém apenas o necessário para rodar:
# - server.js (servidor Next.js)
# - .next/server (código compilado do servidor)
# - node_modules necessários (apenas runtime)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma (necessário em runtime para queries)
# Prisma Client precisa dos arquivos gerados e do schema
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Usar usuário não-root (segurança)
USER nextjs

# Expor porta
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Iniciar aplicação
# O Next.js standalone cria um server.js na raiz do diretório standalone
CMD ["node", "server.js"]
