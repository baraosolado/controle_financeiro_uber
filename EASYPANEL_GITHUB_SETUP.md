# 🚀 Configuração EasyPanel via GitHub

## Passo a Passo Completo

### 1. No EasyPanel - Criar Novo Projeto

1. Acesse seu painel EasyPanel
2. Clique em **"New Project"** ou **"Novo Projeto"**
3. Escolha o tipo: **Docker**

### 2. Configurar Repositório GitHub

**Configurações de Git:**
- **Repository URL:** `https://github.com/baraosolado/controle_financeiro_uber.git`
- **Branch:** `main`
- **Build Command:** (deixar **VAZIO** - o Dockerfile faz tudo)
- **Dockerfile Path:** `Dockerfile.heroku` (ou `Dockerfile` se preferir)
- **Context:** `.` (ponto - significa raiz do projeto)

**⚠️ NOTA:** Se o `Dockerfile` principal não funcionar, use `Dockerfile.heroku` que usa a imagem `heroku/builder:24` otimizada para builds Node.js.

### 3. Configurar Variáveis de Ambiente

No EasyPanel, vá em **"Environment Variables"** e adicione:

```env
# OBRIGATÓRIAS
DATABASE_URL=postgresql://usuario:senha@host:5432/controlefinanceirouber?schema=public
NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>

# URL da aplicação (use uma das opções abaixo)
# Opção 1: Com domínio próprio
NEXTAUTH_URL=https://seu-dominio.com
ALLOWED_ORIGINS=https://seu-dominio.com
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Opção 2: Sem domínio (usando IP ou domínio do EasyPanel)
# NEXTAUTH_URL=http://SEU-IP:PORTA
# ALLOWED_ORIGINS=http://SEU-IP:PORTA
# NEXT_PUBLIC_APP_URL=http://SEU-IP:PORTA
# Exemplo: http://192.168.1.100:3000 ou http://projeto.easypanel.host:3000

# OPCIONAIS (para desenvolvedores)
DEV_EMAIL_1=seu-email@example.com
NEXT_PUBLIC_DEV_EMAIL_1=seu-email@example.com
```

**⚠️ IMPORTANTE sobre URLs:**
- Se você **NÃO tem domínio**, use o IP do servidor ou o domínio fornecido pelo EasyPanel
- Você pode encontrar a URL após fazer o primeiro deploy no EasyPanel
- Exemplo: `http://192.168.1.100:3000` ou `http://seu-projeto.easypanel.host:3000`
- Depois que configurar um domínio, atualize essas variáveis

**⚠️ IMPORTANTE:** Gere o `NEXTAUTH_SECRET` antes:
```bash
openssl rand -base64 32
```

### 4. Configurar Porta

- **Porta Interna:** `3000`
- **Porta Externa:** `3000` (ou a que você preferir)

### 5. Configurações de Build (Docker Build)

O EasyPanel vai executar automaticamente:
```bash
docker build -f Dockerfile -t <imagem> .
```

**Você NÃO precisa configurar nada extra!** O Dockerfile já está pronto.

### 6. Deploy

1. Clique em **"Deploy"** ou **"Build"**
2. Aguarde o build completar (5-10 minutos na primeira vez)
3. Monitore os logs se houver erros

### 7. Após o Deploy - Executar Migrações

Após o primeiro deploy bem-sucedido, execute as migrações do banco:

**Via Terminal do EasyPanel:**
```bash
docker exec -it <container-id> npx prisma migrate deploy
```

**OU via SSH no servidor:**
```bash
# Listar containers
docker ps

# Executar migrações
docker exec -it <nome-do-container> npx prisma migrate deploy
```

## Estrutura do Build

O Dockerfile faz automaticamente:
1. ✅ Instala dependências (`npm ci || npm install`)
2. ✅ Gera Prisma Client (`npx prisma generate`)
3. ✅ Build da aplicação Next.js (`npm run build`)
4. ✅ Cria imagem otimizada para produção

## Troubleshooting

### Erro: "npm ci failed"
- ✅ Já corrigido no Dockerfile com fallback: `npm ci || npm install`
- ✅ Verifique se `package-lock.json` está no repositório

### Erro: "Cannot find module"
- ✅ Execute: `docker exec -it <container> npx prisma generate`
- ✅ Verifique se todas as variáveis de ambiente estão configuradas

### Erro: "Database connection failed"
- ✅ Verifique `DATABASE_URL` está correto
- ✅ Verifique se o banco está acessível do container
- ✅ Verifique firewall/security groups

### Build muito lento
- ✅ Normal na primeira vez (5-10 minutos)
- ✅ Builds subsequentes são mais rápidos (cache)

## Verificação Pós-Deploy

1. ✅ Acesse `https://seu-dominio.com` ou `http://ip:porta`
2. ✅ Teste registro de usuário
3. ✅ Teste login
4. ✅ Verifique dashboard carregando

## Comandos Úteis

### Ver logs em tempo real
```bash
docker logs -f <container-id>
```

### Acessar container
```bash
docker exec -it <container-id> sh
```

### Reiniciar aplicação
```bash
docker restart <container-id>
```

### Ver status
```bash
docker ps
docker ps -a  # inclui containers parados
```

## Checklist Final

- [ ] Repositório GitHub configurado
- [ ] Branch `main` selecionada
- [ ] Dockerfile Path: `Dockerfile`
- [ ] Context: `.`
- [ ] Todas as variáveis de ambiente configuradas
- [ ] `NEXTAUTH_SECRET` gerado e configurado
- [ ] `DATABASE_URL` configurado e testado
- [ ] Porta 3000 configurada
- [ ] Deploy executado com sucesso
- [ ] Migrações executadas
- [ ] Aplicação acessível e funcionando

## Próximos Passos

- [ ] Configurar SSL/HTTPS (Let's Encrypt)
- [ ] Configurar domínio
- [ ] Configurar backup do banco
- [ ] Monitorar logs e performance
