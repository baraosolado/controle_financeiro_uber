# 🚀 Deploy com Buildpacks

## O que são Buildpacks?

Buildpacks são uma alternativa ao Dockerfile que automatizam a detecção e configuração do ambiente de build. Eles são usados por plataformas como:
- **Heroku**
- **Railway**
- **Render**
- **Fly.io**
- **EasyPanel** (com suporte a buildpacks)

## 📋 Arquivos Criados

### 1. `Procfile`
Define o comando para iniciar a aplicação em produção:
```
web: node server.js
```

### 2. `project.toml`
Configuração para Paketo Buildpacks:
- Define buildpacks a serem usados
- Configura variáveis de ambiente durante build
- Configura variáveis de ambiente em runtime

### 3. `.buildpacks`
Lista de buildpacks (formato Heroku):
- Node.js buildpack
- Prisma buildpack

### 4. `package.json`
Adicionado:
- `postinstall`: executa `prisma generate` automaticamente após instalar dependências
- `engines`: especifica versões mínimas de Node.js e npm

## 🔧 Configuração no EasyPanel

### Opção 1: Usar Buildpacks Nativo (se suportado)

1. **Criar novo projeto**
   - Tipo: **Buildpacks** ou **Heroku Buildpacks**
   - Repository URL: `https://github.com/baraosolado/controle_financeiro_uber.git`
   - Branch: `main`

2. **Configurar Buildpacks**
   - Buildpack 1: `heroku/nodejs`
   - Buildpack 2: `heroku-buildpack-prisma` (se disponível)
   - Ou usar `project.toml` automaticamente

3. **Variáveis de Ambiente**
   ```env
   DATABASE_URL=postgresql://usuario:senha@host:5432/nome_banco?schema=public
   NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>
   NEXTAUTH_URL=https://seu-dominio.com
   ALLOWED_ORIGINS=https://seu-dominio.com
   NEXT_PUBLIC_APP_URL=https://seu-dominio.com
   PORT=3000
   NODE_ENV=production
   ```

### Opção 2: Usar Paketo Buildpacks (via CNB)

Se o EasyPanel suportar Cloud Native Buildpacks (CNB):

1. **Configurar Build**
   - Builder: `paketobuildpacks/builder:base` ou `paketobuildpacks/builder:full`
   - O `project.toml` será detectado automaticamente

2. **Variáveis de Ambiente**
   - Mesmas variáveis da Opção 1
   - Variáveis `NEXT_PUBLIC_*` devem ser configuradas como **Build-time variables**

## 🔄 Diferenças entre Buildpacks e Dockerfile

### Buildpacks
✅ **Vantagens:**
- Automático: detecta tipo de aplicação
- Menos configuração manual
- Atualizações automáticas de buildpacks
- Otimizado para cada tipo de app

❌ **Desvantagens:**
- Menos controle sobre o processo
- Pode ser mais lento em alguns casos
- Depende do suporte da plataforma

### Dockerfile
✅ **Vantagens:**
- Controle total sobre o build
- Mais rápido (cache otimizado)
- Funciona em qualquer plataforma Docker

❌ **Desvantagens:**
- Mais configuração manual
- Precisa manter atualizado

## 📝 Processo de Build com Buildpacks

1. **Detecção**: Buildpack detecta que é uma aplicação Node.js
2. **Instalação**: Instala Node.js e npm
3. **Dependências**: Executa `npm install`
4. **Postinstall**: Executa `prisma generate` (via `postinstall` script)
5. **Build**: Executa `npm run build`
6. **Start**: Usa `Procfile` para iniciar (`node server.js`)

## 🗄️ Prisma com Buildpacks

### Build Time
- `DATABASE_URL` fake é usado apenas para gerar Prisma Client
- Não precisa de conexão real com banco durante build

### Runtime
- `DATABASE_URL` real é necessário para queries
- Migrations devem ser executadas manualmente após deploy

### Executar Migrations

```bash
# Via terminal do EasyPanel ou SSH
heroku run npx prisma migrate deploy
# ou
railway run npx prisma migrate deploy
```

## 🔍 Troubleshooting

### Build Falha

1. **Verificar logs do build**
   - Procure por erros específicos
   - Verifique se `prisma generate` foi executado

2. **Verificar variáveis de ambiente**
   - `DATABASE_URL` deve estar configurado (mesmo que fake durante build)
   - `NEXT_PUBLIC_*` devem estar como build-time variables

3. **Verificar Node.js version**
   - `engines.node` no `package.json` deve ser compatível

### Aplicação Não Inicia

1. **Verificar Procfile**
   - Deve ter `web: node server.js`
   - Verificar se `server.js` existe (gerado pelo Next.js standalone)

2. **Verificar PORT**
   - Buildpacks geralmente definem `PORT` automaticamente
   - Aplicação deve usar `process.env.PORT`

3. **Verificar logs de runtime**
   - Procure por erros de conexão com banco
   - Verifique se migrations foram executadas

## 📚 Plataformas que Suportam Buildpacks

### Heroku
- Suporte nativo completo
- Usa `.buildpacks` ou `heroku buildpacks:set`

### Railway
- Suporte via Nixpacks (buildpacks-like)
- Detecta automaticamente

### Render
- Suporte nativo
- Detecta `Procfile` automaticamente

### Fly.io
- Suporte via buildpacks
- Configuração via `fly.toml`

### EasyPanel
- Verificar se suporta buildpacks
- Se não, usar Dockerfile (já configurado)

## 🔄 Migração de Dockerfile para Buildpacks

Se você estava usando Dockerfile e quer migrar:

1. ✅ `Procfile` criado
2. ✅ `project.toml` criado
3. ✅ `.buildpacks` criado
4. ✅ `package.json` atualizado com `postinstall` e `engines`
5. ⚠️ Remover ou renomear `Dockerfile` (se buildpacks tiverem prioridade)
6. ⚠️ Configurar plataforma para usar buildpacks ao invés de Dockerfile

## ✅ Checklist

- [ ] `Procfile` criado e testado
- [ ] `project.toml` configurado
- [ ] `.buildpacks` configurado (se necessário)
- [ ] `package.json` atualizado com `postinstall` e `engines`
- [ ] Variáveis de ambiente configuradas
- [ ] Build testado localmente (se possível)
- [ ] Deploy realizado
- [ ] Migrations executadas
- [ ] Aplicação funcionando

---

**Última atualização:** 2026-01-12
