#!/bin/sh
set -e

echo "🔄 Executando migrações do Prisma..."
npx prisma migrate deploy || echo "⚠️  Aviso: Migrações falharam ou já estão atualizadas"

echo "✅ Iniciando servidor Next.js..."
exec node server.js
