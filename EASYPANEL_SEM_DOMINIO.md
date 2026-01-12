# 🚀 Deploy no EasyPanel SEM Domínio Próprio

## Guia Rápido para Usar IP ou Domínio do EasyPanel

### 1. Configurar Variáveis de Ambiente

No EasyPanel, configure estas variáveis:

```env
# Database (obrigatório)
DATABASE_URL=postgresql://usuario:senha@host:5432/controlefinanceirouber?schema=public

# NextAuth Secret (obrigatório - gere com: openssl rand -base64 32)
NEXTAUTH_SECRET=seu-secret-aqui

# URLs - Use o IP do servidor ou domínio do EasyPanel
# Você vai descobrir isso APÓS o primeiro deploy
NEXTAUTH_URL=http://SEU-IP:PORTA
ALLOWED_ORIGINS=http://SEU-IP:PORTA
NEXT_PUBLIC_APP_URL=http://SEU-IP:PORTA
```

### 2. Como Descobrir a URL

**Opção A: IP do Servidor**
- No EasyPanel, vá em "Settings" ou "Configurações" do servidor
- Encontre o IP público do servidor
- Use: `http://IP:PORTA` (exemplo: `http://192.168.1.100:3000`)

**Opção B: Domínio do EasyPanel**
- Alguns EasyPanel fornecem um subdomínio automático
- Exemplo: `http://seu-projeto.easypanel.host:3000`
- Verifique na página do projeto após o deploy

**Opção C: Após o Primeiro Deploy**
1. Faça o deploy com URLs temporárias (pode dar erro de autenticação)
2. Verifique os logs ou a página do projeto no EasyPanel
3. Veja qual URL está sendo usada
4. Atualize as variáveis de ambiente com a URL correta
5. Faça redeploy

### 3. Exemplo de Configuração Inicial

Para começar, use valores temporários que você vai ajustar depois:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/controlefinanceirouber
NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Depois do primeiro deploy, atualize com a URL real.

### 4. Passo a Passo Completo

1. **Configure as variáveis acima** (use `localhost:3000` temporariamente)
2. **Faça o deploy** no EasyPanel
3. **Após o deploy**, verifique:
   - Acesse a página do projeto no EasyPanel
   - Veja qual URL/IP está sendo usado
   - Ou verifique os logs do container
4. **Atualize as variáveis** com a URL real:
   ```env
   NEXTAUTH_URL=http://URL-REAL-DESCOBERTA
   ALLOWED_ORIGINS=http://URL-REAL-DESCOBERTA
   NEXT_PUBLIC_APP_URL=http://URL-REAL-DESCOBERTA
   ```
5. **Redeploy** ou reinicie o container

### 5. Verificar se Está Funcionando

Após configurar as URLs corretas:

1. Acesse `http://SEU-IP:PORTA` ou `http://DOMINIO-EASYPANEL:PORTA`
2. Teste o registro de usuário
3. Teste o login
4. Se der erro de autenticação, as URLs estão erradas - atualize e reinicie

### 6. Quando Tiver Domínio Próprio

Quando você configurar um domínio próprio:

1. Configure DNS apontando para o IP do servidor
2. Configure SSL/HTTPS no EasyPanel (Let's Encrypt)
3. Atualize as variáveis:
   ```env
   NEXTAUTH_URL=https://seu-dominio.com
   ALLOWED_ORIGINS=https://seu-dominio.com
   NEXT_PUBLIC_APP_URL=https://seu-dominio.com
   ```
4. Redeploy

### 7. Troubleshooting

**Erro: "Invalid redirect URL"**
- ✅ Verifique se `NEXTAUTH_URL` está correto
- ✅ Deve ser exatamente a URL que você está acessando (com http:// e porta)

**Erro: "CORS error"**
- ✅ Verifique se `ALLOWED_ORIGINS` inclui a URL que você está usando
- ✅ Deve ser exatamente igual (com http:// e porta)

**Não consegue fazer login**
- ✅ Verifique se todas as URLs estão iguais e corretas
- ✅ Reinicie o container após atualizar as variáveis

### 8. Dica Importante

**Para desenvolvimento/teste:**
- Você pode usar `http://localhost:3000` temporariamente
- Depois atualize com a URL real do servidor

**Para produção:**
- Configure um domínio próprio com SSL
- Use `https://` em todas as URLs
