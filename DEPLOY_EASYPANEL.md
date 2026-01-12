# 🚀 Guia de Deploy no EasyPanel

## Pré-requisitos

1. Conta no EasyPanel
2. Servidor com Docker instalado
3. Domínio configurado (opcional, mas recomendado)
4. Banco de dados PostgreSQL (pode ser externo ou via docker-compose)

## Passo a Passo

### 1. Preparar Variáveis de Ambiente

No EasyPanel, configure as seguintes variáveis de ambiente:

```env
# Database (ajuste conforme seu banco)
DATABASE_URL=postgresql://usuario:senha@host:5432/controlefinanceirouber?schema=public

# NextAuth (OBRIGATÓRIO - gere com: openssl rand -base64 32)
NEXTAUTH_SECRET=seu-secret-aqui-gerado-com-openssl-rand-base64-32
NEXTAUTH_URL=https://seu-dominio.com

# CORS
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com

# App URL
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Desenvolvedores (opcional - para acesso à documentação)
DEV_EMAIL_1=dev@example.com
NEXT_PUBLIC_DEV_EMAIL_1=dev@example.com
```

### 2. Gerar NEXTAUTH_SECRET

Execute no terminal:
```bash
openssl rand -base64 32
```

Copie o resultado e use como `NEXTAUTH_SECRET`.

### 3. Deploy no EasyPanel

#### Método 1: Deploy via Git (Recomendado)

1. **Criar novo projeto**
   - Nome: `controle-financeiro-uber`
   - Tipo: **Docker**

2. **Configurar repositório Git**
   - URL: `https://github.com/baraosolado/controle_financeiro_uber.git`
   - Branch: `main`
   - Build Command: (deixar vazio)

3. **Configurar Dockerfile**
   - Caminho: `Dockerfile`
   - Context: `.` (raiz do projeto)

4. **Configurar variáveis de ambiente**
   - Adicione todas as variáveis listadas acima
   - **IMPORTANTE**: Configure `NEXTAUTH_SECRET` e `DATABASE_URL`

5. **Configurar porta**
   - Porta interna: `3000`
   - Porta externa: `3000` (ou a porta que você preferir)

6. **Deploy**
   - Clique em "Deploy" ou "Build"
   - Aguarde o build completar (pode levar alguns minutos)

#### Método 2: Deploy via docker-compose

1. **Criar novo projeto**
   - Tipo: **Docker Compose**

2. **Configurar docker-compose.yml**
   - Copie o conteúdo do arquivo `docker-compose.yml`
   - Ajuste as variáveis de ambiente

3. **Deploy**

### 4. Configurar Banco de Dados

#### Opção A: PostgreSQL Externo

1. Configure a `DATABASE_URL` apontando para seu banco externo
2. Execute as migrações após o primeiro deploy:

```bash
# Via terminal do EasyPanel ou SSH
docker exec -it <container-id> sh
npx prisma migrate deploy
```

#### Opção B: PostgreSQL via docker-compose

O banco será criado automaticamente. Após o deploy, execute:

```bash
# Acessar o container do app
docker exec -it <container-id> sh

# Executar migrações
npx prisma migrate deploy
```

### 5. Verificar Deploy

1. Acesse `https://seu-dominio.com` ou `http://seu-ip:porta`
2. Teste o registro de usuário
3. Teste o login
4. Verifique o dashboard

### 6. Configurar SSL/HTTPS (Recomendado)

No EasyPanel:
1. Vá em "SSL/TLS" ou "Certificates"
2. Configure certificado Let's Encrypt (gratuito)
3. Force HTTPS redirect

### 7. Configurar Domínio

1. No EasyPanel, vá em "Domains" ou "Nginx"
2. Adicione seu domínio
3. Configure DNS apontando para o IP do servidor:
   - Tipo A: `@` → IP do servidor
   - Tipo A: `www` → IP do servidor

## Comandos Úteis

### Ver logs em tempo real
```bash
docker logs -f <container-id>
```

### Acessar container
```bash
docker exec -it <container-id> sh
```

### Executar migrações
```bash
docker exec -it <container-id> npx prisma migrate deploy
```

### Gerar Prisma Client (se necessário)
```bash
docker exec -it <container-id> npx prisma generate
```

### Reiniciar aplicação
```bash
docker restart <container-id>
```

### Verificar status
```bash
docker ps
```

## Troubleshooting

### Erro de conexão com banco
- ✅ Verifique se `DATABASE_URL` está correto
- ✅ Verifique se o banco está acessível do container
- ✅ Se usar docker-compose, verifique se o serviço `db` está rodando: `docker ps`

### Erro de build
- ✅ Verifique se todas as variáveis de ambiente estão configuradas
- ✅ Verifique os logs do build no EasyPanel
- ✅ Verifique se o Dockerfile está no caminho correto

### Erro 500 Internal Server Error
- ✅ Verifique os logs: `docker logs <container-id>`
- ✅ Verifique se as migrações foram executadas
- ✅ Verifique se `NEXTAUTH_SECRET` está configurado
- ✅ Verifique se `DATABASE_URL` está correto

### Erro "Prisma Client not generated"
```bash
docker exec -it <container-id> npx prisma generate
```

### Aplicação não inicia
- ✅ Verifique os logs: `docker logs <container-id>`
- ✅ Verifique se a porta está correta
- ✅ Verifique se há conflito de portas

## Monitoramento

### Health Check
Configure no EasyPanel:
- Path: `/api/health` (se disponível) ou `/`
- Interval: 30s
- Timeout: 10s

### Restart Policy
- Configure: `unless-stopped` ou `always`

### Recursos
Configure limites recomendados:
- CPU: 1-2 cores
- RAM: 1-2 GB
- Swap: 512 MB

## Backup

### Backup do Banco de Dados

Configure backup automático do PostgreSQL:

```bash
# Backup manual
docker exec <db-container-id> pg_dump -U postgres controlefinanceirouber > backup.sql

# Restore
docker exec -i <db-container-id> psql -U postgres controlefinanceirouber < backup.sql
```

### Backup via EasyPanel
- Configure backup automático se disponível
- Ou use script de backup agendado

## Atualizações

Para atualizar a aplicação:

1. **Faça push das mudanças para o GitHub**
   ```bash
   git add .
   git commit -m "sua mensagem"
   git push
   ```

2. **No EasyPanel**
   - Clique em "Redeploy" ou "Rebuild"
   - A aplicação será reconstruída automaticamente

3. **Se houver mudanças no schema do banco**
   ```bash
   docker exec -it <container-id> npx prisma migrate deploy
   ```

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] `NEXTAUTH_SECRET` gerado e configurado
- [ ] `DATABASE_URL` configurado e testado
- [ ] Dockerfile no caminho correto
- [ ] Porta configurada (3000)
- [ ] Build completado com sucesso
- [ ] Migrações executadas
- [ ] SSL/HTTPS configurado (se usar domínio)
- [ ] Domínio configurado e DNS apontado
- [ ] Aplicação acessível e funcionando
- [ ] Teste de registro/login funcionando

## Suporte

Se encontrar problemas:
1. Verifique os logs no EasyPanel
2. Verifique os logs do container: `docker logs <container-id>`
3. Verifique se todas as variáveis estão configuradas
4. Verifique se o banco de dados está acessível
