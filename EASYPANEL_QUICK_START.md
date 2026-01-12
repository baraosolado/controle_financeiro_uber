# ⚡ Quick Start - Deploy no EasyPanel

## Configuração Rápida

### 1. No EasyPanel - Criar Projeto Docker

**Configurações Básicas:**
- **Nome do Projeto:** `controle-financeiro-uber`
- **Tipo:** Docker
- **Repositório Git:** `https://github.com/baraosolado/controle_financeiro_uber.git`
- **Branch:** `main`
- **Dockerfile Path:** `Dockerfile`
- **Context:** `.` (raiz)
- **Porta Interna:** `3000`
- **Porta Externa:** `3000` (ou a que você preferir)

### 2. Variáveis de Ambiente (OBRIGATÓRIAS)

Adicione estas variáveis no EasyPanel:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/controlefinanceirouber?schema=public
NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>
NEXTAUTH_URL=https://seu-dominio.com
ALLOWED_ORIGINS=https://seu-dominio.com
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### 3. Gerar NEXTAUTH_SECRET

No terminal do seu computador:
```bash
openssl rand -base64 32
```

Copie o resultado e cole em `NEXTAUTH_SECRET` no EasyPanel.

### 4. Deploy

1. Clique em **"Deploy"** ou **"Build"**
2. Aguarde o build (5-10 minutos na primeira vez)
3. Verifique os logs se houver erros

### 5. Executar Migrações do Banco

Após o deploy, execute:

```bash
# Via terminal do EasyPanel ou SSH
docker exec -it <container-id> npx prisma migrate deploy
```

**OU** crie um script de inicialização (veja abaixo).

## Script de Inicialização Automática

Crie um arquivo `start.sh` para executar migrações automaticamente:

```bash
#!/bin/sh
npx prisma migrate deploy
node server.js
```

E atualize o Dockerfile para usar este script (opcional).

## Verificação Pós-Deploy

1. ✅ Acesse `https://seu-dominio.com` ou `http://ip:porta`
2. ✅ Teste registro de usuário
3. ✅ Teste login
4. ✅ Verifique dashboard

## Problemas Comuns

### Build falha
- Verifique se todas as variáveis estão configuradas
- Verifique logs do build no EasyPanel

### Erro 500
- Execute migrações: `docker exec -it <container-id> npx prisma migrate deploy`
- Verifique `NEXTAUTH_SECRET` está configurado
- Verifique `DATABASE_URL` está correto

### Não conecta ao banco
- Verifique se o banco está acessível do container
- Se usar PostgreSQL externo, verifique firewall/security groups

## Próximos Passos

- [ ] Configurar SSL/HTTPS (Let's Encrypt)
- [ ] Configurar domínio
- [ ] Configurar backup do banco
- [ ] Monitorar logs e performance
