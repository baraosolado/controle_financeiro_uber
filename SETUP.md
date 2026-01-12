# Guia de Configuração - Sistema de Controle Financeiro

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- PostgreSQL 12 ou superior (local ou remoto)

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados PostgreSQL

1. Crie um banco de dados PostgreSQL (local ou remoto)
2. Anote as credenciais de conexão:
   - Host
   - Porta (padrão: 5432)
   - Nome do banco
   - Usuário
   - Senha

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_secret_aqui_gerado_aleatoriamente

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Ou use um gerador online: https://generate-secret.vercel.app/32

### 4. Configurar Prisma

1. Gerar o cliente Prisma:
```bash
npm run db:generate
```

2. Executar as migrations para criar as tabelas:
```bash
npm run db:migrate
```

Isso criará:
- Tabela `users` (usuários)
- Tabela `records` (registros financeiros)
- Tabela `password_resets` (recuperação de senha)
- Índices para performance
- Constraints e validações

### 5. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 🧪 Testar o Sistema

1. Acesse `http://localhost:3000`
2. Você será redirecionado para a tela de login
3. Clique em "Cadastre-se"
4. Crie uma conta de teste
5. Após o cadastro, você será redirecionado para o dashboard
6. Clique em "Novo Registro" para criar seu primeiro registro

## 🛠️ Comandos Úteis

- `npm run dev` - Iniciar servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run db:migrate` - Executar migrations
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:studio` - Abrir Prisma Studio (interface visual do banco)

## 📦 Deploy

### Vercel (Recomendado)

1. Faça push do código para um repositório Git (GitHub, GitLab, etc.)
2. Acesse https://vercel.com
3. Importe seu repositório
4. Configure as variáveis de ambiente:
   - `DATABASE_URL` (URL do seu PostgreSQL)
   - `NEXTAUTH_URL` (URL do seu deploy)
   - `NEXTAUTH_SECRET` (mesmo secret usado em dev)
   - `NEXT_PUBLIC_APP_URL` (URL do seu deploy)
5. Deploy automático!

**Nota:** Para produção, use um PostgreSQL gerenciado como:
- Supabase (PostgreSQL gerenciado)
- Neon
- Railway
- AWS RDS
- DigitalOcean Managed Databases

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🔒 Segurança

- ✅ Autenticação via NextAuth.js com JWT
- ✅ Senhas com hash bcrypt (salt rounds: 10)
- ✅ Validação de dados no frontend e backend (Zod)
- ✅ Proteção de rotas com middleware
- ✅ Tokens de recuperação de senha com expiração

## 📝 Estrutura do Projeto

```
controlefinanceirouber/
├── app/                    # Páginas Next.js (App Router)
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticação (NextAuth)
│   │   ├── records/      # CRUD de registros
│   │   └── user/          # Perfil e configurações
│   ├── dashboard/         # Dashboard e registros
│   ├── login/            # Autenticação
│   ├── profile/          # Perfil do usuário
│   └── ...
├── components/           # Componentes React
│   ├── dashboard/        # Componentes do dashboard
│   ├── profile/         # Componentes de perfil
│   └── ui/              # Componentes reutilizáveis
├── lib/                 # Utilitários e configurações
│   ├── prisma.ts        # Cliente Prisma
│   ├── auth.ts          # Funções de autenticação
│   └── auth-helpers.ts   # Helpers de autenticação
├── prisma/              # Prisma
│   └── schema.prisma    # Schema do banco de dados
└── types/               # Tipos TypeScript
```

## 🐛 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se o PostgreSQL está rodando
- Confirme se a `DATABASE_URL` está correta
- Teste a conexão com: `psql $DATABASE_URL`

### Erro: "Prisma Client has not been generated yet"
- Execute: `npm run db:generate`

### Erro: "Migration failed"
- Verifique se o banco de dados está acessível
- Confirme se as credenciais estão corretas
- Tente resetar: `npx prisma migrate reset` (⚠️ apaga todos os dados)

### Erro de autenticação
- Verifique se `NEXTAUTH_SECRET` está configurado
- Confirme se `NEXTAUTH_URL` está correto
- Limpe os cookies do navegador

## 📚 Próximos Passos

Após configurar o sistema, você pode:
- Personalizar cores e tema em `tailwind.config.js`
- Adicionar novas funcionalidades conforme o PRD
- Configurar e-mails de notificação (SendGrid, Resend)
- Adicionar analytics (Google Analytics, Plausible)
- Configurar backups automáticos do banco

## 💡 Dicas

- Use Prisma Studio para visualizar dados: `npm run db:studio`
- Configure backups regulares do PostgreSQL
- Use variáveis de ambiente diferentes para dev/prod
- Monitore o uso do banco de dados
- Considere usar um pool de conexões em produção
