# 🔐 Credenciais de Desenvolvedor

**⚠️ ATENÇÃO: Este arquivo contém informações sensíveis. NÃO commitar no Git!**

## 📧 Credenciais Padrão (Seed)

Se você executou o seed do banco de dados (`npm run db:seed`), existe um usuário de desenvolvimento criado automaticamente:

- **Email:** `dev@teste.com`
- **Senha:** `dev123`

### Como Criar o Usuário de Desenvolvimento

```bash
npm run db:seed
```

Isso criará o usuário se ele não existir.

---

## 🔑 Como Obter Acesso de Desenvolvedor

Existem **3 formas** de obter acesso de desenvolvedor:

### 1. Usar o Usuário do Seed (se existir)

1. Faça login com:
   - Email: `dev@teste.com`
   - Senha: `dev123`
2. Acesse `/docs/debug`
3. Clique em **"Ativar Acesso de Desenvolvedor"**

### 2. Configurar Seu Email nas Variáveis de Ambiente

Adicione seu email no `.env.local` (desenvolvimento) ou no EasyPanel (produção):

```env
# Desenvolvimento (.env.local)
DEV_EMAIL_1=seu-email@example.com
NEXT_PUBLIC_DEV_EMAIL_1=seu-email@example.com

# Produção (EasyPanel - Build Args)
NEXT_PUBLIC_DEV_EMAIL_1=seu-email@example.com
```

**Importante:** 
- Em desenvolvimento, use `DEV_EMAIL_1` e `NEXT_PUBLIC_DEV_EMAIL_1`
- Em produção (EasyPanel), configure `NEXT_PUBLIC_DEV_EMAIL_1` como **Build Arg**

Depois, faça login com esse email e você terá acesso automático.

### 3. Ativar Manualmente via Página de Debug

1. Faça login com **qualquer conta**
2. Acesse `/docs/debug`
3. Clique em **"Ativar Acesso de Desenvolvedor"**

Isso define `isDeveloper: true` nas preferências do usuário no banco de dados.

---

## 🔍 Verificar Status de Desenvolvedor

Acesse `/docs/debug` para ver:
- Seu email atual
- Se você tem acesso de desenvolvedor
- Se o acesso veio de variáveis de ambiente ou preferências
- Informações da sessão

---

## 📝 O Que o Acesso de Desenvolvedor Permite

Com acesso de desenvolvedor, você pode:

- ✅ Acessar `/docs` - Documentação Swagger completa da API
- ✅ Ver todos os endpoints da API
- ✅ Testar endpoints diretamente no Swagger UI
- ✅ Ver exemplos de requisições e respostas

---

## 🛠️ Configuração Completa

### Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Credenciais de Desenvolvedor
DEV_EMAIL_1=seu-email@example.com
DEV_EMAIL_2=outro-dev@example.com
DEV_EMAIL_3=terceiro-dev@example.com

# Variáveis públicas (para build)
NEXT_PUBLIC_DEV_EMAIL_1=seu-email@example.com
NEXT_PUBLIC_DEV_EMAIL_2=outro-dev@example.com
NEXT_PUBLIC_DEV_EMAIL_3=terceiro-dev@example.com
```

### Produção (EasyPanel)

Configure como **Build Arguments**:

```env
NEXT_PUBLIC_DEV_EMAIL_1=seu-email@example.com
NEXT_PUBLIC_DEV_EMAIL_2=outro-dev@example.com
NEXT_PUBLIC_DEV_EMAIL_3=terceiro-dev@example.com
```

**⚠️ IMPORTANTE:** 
- Variáveis `NEXT_PUBLIC_*` são injetadas no **build time**
- Se alterar essas variáveis, é necessário fazer **rebuild** do container
- Configure como **Build Args**, não apenas Environment Variables

---

## 🔒 Segurança

- ✅ Apenas usuários autenticados podem acessar `/docs`
- ✅ Verificação dupla: email nas variáveis OU flag `isDeveloper` nas preferências
- ✅ Página `/docs` não é indexada pelos buscadores
- ✅ Endpoint `/api/swagger.json` também verifica acesso de desenvolvedor

---

## 🐛 Troubleshooting

### Não consigo acessar `/docs`

1. Verifique se está logado
2. Acesse `/docs/debug` para ver seu status
3. Verifique se seu email está nas variáveis de ambiente
4. Tente ativar manualmente via "Ativar Acesso de Desenvolvedor"

### Variáveis de ambiente não funcionam em produção

- Verifique se configurou como **Build Args** no EasyPanel
- Faça **rebuild** do container (não apenas restart)
- Verifique se o email está exatamente igual ao do login (case-sensitive)

### Esqueci minhas credenciais

1. Execute `npm run db:seed` para criar/verificar usuário padrão
2. Ou crie uma nova conta e ative via `/docs/debug`
3. Ou configure seu email nas variáveis de ambiente

---

## 📚 Referências

- Página de Debug: `/docs/debug`
- Documentação Swagger: `/docs`
- API de verificação: `/api/user/check-developer`
- API de ativação: `/api/user/set-developer` (PUT)

---

**Última atualização:** 2026-01-13
