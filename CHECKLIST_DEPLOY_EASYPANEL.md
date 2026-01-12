# ✅ Checklist de Deploy - EasyPanel

## 📋 Pré-requisitos

- [ ] Conta no EasyPanel configurada
- [ ] Servidor com Docker instalado
- [ ] Banco de dados PostgreSQL criado e acessível
- [ ] Repositório Git configurado (GitHub/GitLab)
- [ ] Domínio configurado (opcional, mas recomendado)

---

## 🔧 Configuração do Projeto no EasyPanel

### 1. Criar Novo Projeto

- [ ] Acessar EasyPanel
- [ ] Clicar em **"New Project"** ou **"Novo Projeto"**
- [ ] Escolher tipo: **Docker**
- [ ] Nome do projeto: `controle-financeiro-uber`

### 2. Configurar Repositório Git

- [ ] **Repository URL:** `https://github.com/baraosolado/controle_financeiro_uber.git`
- [ ] **Branch:** `main`
- [ ] **Build Command:** (deixar **VAZIO** - o Dockerfile faz tudo)
- [ ] **Dockerfile Path:** `Dockerfile`
- [ ] **Context:** `.` (ponto - raiz do projeto)

### 3. Configurar Portas

- [ ] **Porta Interna:** `3000`
- [ ] **Porta Externa:** `3000` (ou a porta desejada)

---

## 🔐 Variáveis de Ambiente

### Variáveis OBRIGATÓRIAS (Runtime)

Estas variáveis são usadas quando a aplicação está rodando:

- [ ] **DATABASE_URL**
  ```env
  DATABASE_URL=postgresql://usuario:senha@host:5432/nome_banco?schema=public
  ```
  - Substituir `usuario`, `senha`, `host`, `nome_banco` pelos valores reais

- [ ] **NEXTAUTH_SECRET**
  ```bash
  # Gerar com:
  openssl rand -base64 32
  ```
  - Copiar o resultado e colar no EasyPanel

- [ ] **NEXTAUTH_URL**
  - Com domínio: `https://seu-dominio.com`
  - Sem domínio: `http://SEU-IP:PORTA` (descobrir após primeiro deploy)

- [ ] **ALLOWED_ORIGINS**
  - Com domínio: `https://seu-dominio.com`
  - Sem domínio: `http://SEU-IP:PORTA`

### Variáveis OBRIGATÓRIAS (Build Time)

⚠️ **IMPORTANTE:** Estas variáveis devem ser configuradas como **Build Args** no EasyPanel, não apenas como Environment Variables.

- [ ] **NEXT_PUBLIC_APP_URL** (Build Arg)
  - Com domínio: `https://seu-dominio.com`
  - Sem domínio: `http://SEU-IP:PORTA`
  - **Por quê?** Variáveis `NEXT_PUBLIC_*` são injetadas no build time e ficam no bundle JavaScript

### Variáveis OPCIONAIS (Build Time)

- [ ] **NEXT_PUBLIC_DEV_EMAIL_1** (Build Arg - para acesso à documentação)
- [ ] **NEXT_PUBLIC_DEV_EMAIL_2** (Build Arg - opcional)
- [ ] **NEXT_PUBLIC_DEV_EMAIL_3** (Build Arg - opcional)

**⚠️ IMPORTANTE sobre Build Args:**
- No EasyPanel, configure como **Build Arguments** ou **Build-time Variables**
- Se alterar essas variáveis, é necessário fazer **rebuild** do container
- Variáveis `NEXT_PUBLIC_*` não podem ser alteradas em runtime

---

## 🚀 Deploy

### Primeiro Deploy

- [ ] Verificar todas as variáveis de ambiente configuradas
- [ ] Verificar se variáveis `NEXT_PUBLIC_*` estão como Build Args
- [ ] Clicar em **"Deploy"** ou **"Build"**
- [ ] Aguardar build completar (5-10 minutos na primeira vez)
- [ ] Verificar logs se houver erros

### Após o Deploy

- [ ] Verificar se o container está rodando
- [ ] Verificar logs do container
- [ ] Testar acesso à aplicação
- [ ] Se não tiver domínio, descobrir IP/URL do EasyPanel e atualizar variáveis

---

## 🗄️ Banco de Dados

### Executar Migrações

Após o primeiro deploy, executar migrações:

```bash
# Via terminal do EasyPanel ou SSH
docker exec -it <container-id> npx prisma migrate deploy
```

- [ ] Executar migrações do Prisma
- [ ] Verificar se as tabelas foram criadas
- [ ] (Opcional) Executar seed: `docker exec -it <container-id> npm run db:seed`

---

## 🔍 Verificações Pós-Deploy

### Funcionalidades Básicas

- [ ] Acessar a aplicação no navegador
- [ ] Testar registro de novo usuário
- [ ] Testar login
- [ ] Testar criação de registro diário
- [ ] Verificar dashboard carregando dados

### Funcionalidades Avançadas

- [ ] Testar acesso à documentação (`/docs`) - se configurado
- [ ] Verificar API respondendo (`/api/stats/dashboard`)
- [ ] Testar exportação de dados
- [ ] Verificar gráficos no dashboard

### Logs e Monitoramento

- [ ] Verificar logs do container (sem erros)
- [ ] Verificar uso de memória/CPU
- [ ] Configurar alertas (se disponível no EasyPanel)

---

## 🔄 Atualizações Futuras

### Processo de Atualização

1. [ ] Fazer push das alterações para o repositório Git
2. [ ] No EasyPanel, clicar em **"Redeploy"** ou **"Rebuild"**
3. [ ] Aguardar build completar
4. [ ] Verificar se aplicação está funcionando
5. [ ] Executar migrações se houver mudanças no schema:
   ```bash
   docker exec -it <container-id> npx prisma migrate deploy
   ```

### Quando Fazer Rebuild

- [ ] Alterações no código
- [ ] Alterações em variáveis `NEXT_PUBLIC_*`
- [ ] Alterações em `package.json` (novas dependências)
- [ ] Alterações em `next.config.js`

### Quando NÃO Precisa Rebuild

- [ ] Alterações apenas em variáveis de ambiente runtime (não `NEXT_PUBLIC_*`)
- [ ] Apenas restart do container

---

## 🐛 Troubleshooting

### Build Falha

- [ ] Verificar logs completos do build
- [ ] Verificar se todas as variáveis estão configuradas
- [ ] Verificar se `NEXT_PUBLIC_*` estão como Build Args
- [ ] Verificar se o repositório Git está acessível
- [ ] Verificar se `DATABASE_URL` fake está sendo usado durante build (não precisa ser real)

### Aplicação Não Inicia

- [ ] Verificar logs do container
- [ ] Verificar se `DATABASE_URL` está correto (runtime)
- [ ] Verificar se `NEXTAUTH_SECRET` está configurado
- [ ] Verificar se a porta está correta
- [ ] Verificar se `server.js` existe (gerado pelo Next.js standalone)

### Erro de Conexão com Banco

- [ ] Verificar se o PostgreSQL está acessível
- [ ] Verificar credenciais em `DATABASE_URL`
- [ ] Verificar firewall/security groups
- [ ] Testar conexão manual: `psql $DATABASE_URL`

### Erro de Autenticação

- [ ] Verificar se `NEXTAUTH_URL` está correto
- [ ] Verificar se `NEXTAUTH_SECRET` está configurado
- [ ] Limpar cookies do navegador
- [ ] Verificar se `ALLOWED_ORIGINS` está correto

### Variáveis NEXT_PUBLIC_* Não Funcionam

- [ ] Verificar se estão configuradas como **Build Args**
- [ ] Fazer **rebuild** do container (não apenas restart)
- [ ] Verificar se foram passadas durante o build (ver logs)

---

## 📝 Notas Importantes

### Variáveis NEXT_PUBLIC_*

- Variáveis `NEXT_PUBLIC_*` são injetadas no **build time**, não em runtime
- Se alterar essas variáveis, é necessário fazer **rebuild** do container
- No EasyPanel, configure como **Build Arguments**, não apenas Environment Variables
- Essas variáveis ficam no bundle JavaScript e não podem ser alteradas sem rebuild

### Segurança

- [ ] Nunca commitar `.env` ou `.env.local` no Git
- [ ] Usar variáveis de ambiente do EasyPanel para dados sensíveis
- [ ] Gerar `NEXTAUTH_SECRET` único para cada ambiente
- [ ] Usar HTTPS em produção (configurar SSL no EasyPanel)
- [ ] Container roda com usuário não-root (segurança)

### Performance

- [ ] Monitorar uso de memória/CPU
- [ ] Configurar limites de recursos no EasyPanel
- [ ] Considerar usar CDN para assets estáticos (futuro)
- [ ] Configurar cache do Next.js (se necessário)

### Multi-stage Build

O Dockerfile usa multi-stage build:
- **deps**: Instala dependências (cache otimizado)
- **builder**: Compila aplicação
- **runner**: Imagem final minimalista (apenas runtime)

Isso resulta em uma imagem ~80% menor que build único.

---

## ✅ Checklist Final

- [ ] Aplicação rodando e acessível
- [ ] Banco de dados conectado
- [ ] Migrações executadas
- [ ] Autenticação funcionando
- [ ] Funcionalidades principais testadas
- [ ] Logs sem erros críticos
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Variáveis `NEXT_PUBLIC_*` configuradas como Build Args
- [ ] Documentação de deploy atualizada

---

## 📚 Documentação Adicional

- `DEPLOY_EASYPANEL.md` - Guia completo de deploy
- `EASYPANEL_QUICK_START.md` - Quick start
- `EASYPANEL_GITHUB_SETUP.md` - Configuração via GitHub
- `EASYPANEL_SEM_DOMINIO.md` - Deploy sem domínio próprio
- `TROUBLESHOOTING_BUILD.md` - Solução de problemas

---

**Última atualização:** 2026-01-12
