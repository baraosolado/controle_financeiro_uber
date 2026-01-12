# Sistema de Controle Financeiro para Motoristas de Aplicativo

Sistema web/mobile para motoristas de aplicativo controlarem suas finanças diárias.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- PostgreSQL 12+

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Preencha as variáveis no `.env.local`:
```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_secret_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Configure o banco de dados:
```bash
npm run db:generate
npm run db:migrate
```

5. Execute o projeto:
```bash
npm run dev
```

6. Acesse `http://localhost:3000`

## 📊 Estrutura do Banco de Dados

O Prisma gerencia o schema do banco. As tabelas são criadas automaticamente ao executar as migrations:

- `users` - Usuários do sistema
- `records` - Registros financeiros diários
- `password_resets` - Tokens de recuperação de senha

## 📝 Funcionalidades

### Fase 1 (MVP)
- ✅ Autenticação completa (NextAuth.js)
- ✅ Registro diário de dados
- ✅ Dashboard com resumo
- ✅ Gráficos de evolução
- ✅ Histórico de registros
- ✅ Perfil do usuário

## 🔒 Segurança

- Autenticação via NextAuth.js com JWT
- Senhas com hash bcrypt (salt rounds: 10)
- Validação de dados no frontend e backend (Zod)
- Proteção de rotas com middleware
- Tokens de recuperação com expiração

## 📚 Documentação

Consulte o arquivo `SETUP.md` para instruções detalhadas de configuração.

## 🛠️ Comandos Disponíveis

- `npm run dev` - Iniciar servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Iniciar servidor de produção
- `npm run db:migrate` - Executar migrations
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:studio` - Abrir Prisma Studio

## 📦 Deploy

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Vercel (recomendado)
- Netlify
- Railway
- Render

**Importante:** Configure todas as variáveis de ambiente no serviço de deploy.

## 📄 Licença

Este projeto é privado e proprietário.
