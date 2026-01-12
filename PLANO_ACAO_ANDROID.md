
# 📋 PLANO DE AÇÃO - Preparação para App Android**Objetivo:** Corrigir problemas de segurança e preparar aplicação para transformação em app Android**Status:** 🟡 Em andamento  **Data de criação:** 2026-01-13  **Última atualização:** 2026-01-13---## 🎯 FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA (OBRIGATÓRIO)### ✅ Tarefa 1.1: Implementar Rate Limiting**Prioridade:** 🔴 CRÍTICA  **Tempo estimado:** 30 minutos  **Status:** ⬜ Pendente**Ações:**- [ ] Instalar dependência: `npm install lru-cache @types/lru-cache`- [ ] Criar arquivo `lib/rate-limit.ts` com middleware de rate limiting- [ ] Implementar função `rateLimitMiddleware(identifier: string, limit: number)`- [ ] Aplicar rate limiting em:  - [ ] `app/api/auth/login/route.ts` (5 tentativas/minuto)  - [ ] `app/api/auth/register/route.ts` (3 tentativas/minuto)  - [ ] `app/api/auth/forgot-password/route.ts` (3 tentativas/minuto)  - [ ] `app/api/records/route.ts` (20 requisições/minuto)  - [ ] `app/api/v1/records/route.ts` (50 requisições/minuto)  - [ ] `app/api/import/route.ts` (5 requisições/minuto)**Arquivos a criar/modificar:**- `lib/rate-limit.ts` (NOVO)- `app/api/auth/login/route.ts` (MODIFICAR)- `app/api/auth/register/route.ts` (MODIFICAR)- `app/api/auth/forgot-password/route.ts` (MODIFICAR)- `app/api/records/route.ts` (MODIFICAR)- `app/api/v1/records/route.ts` (MODIFICAR)- `app/api/import/route.ts` (MODIFICAR)---### ✅ Tarefa 1.2: Adicionar Headers de Segurança**Prioridade:** 🔴 CRÍTICA  **Tempo estimado:** 15 minutos  **Status:** ⬜ Pendente**Ações:**- [ ] Modificar `next.config.js` para adicionar headers de segurança- [ ] Adicionar headers:  - [ ] `X-Frame-Options: DENY`  - [ ] `X-Content-Type-Options: nosniff`  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`  - [ ] `Permissions-Policy` (configurar conforme necessário)**Arquivos a modificar:**- `next.config.js`---### ✅ Tarefa 1.3: Configurar CORS**Prioridade:** 🔴 CRÍTICA  **Tempo estimado:** 20 minutos  **Status:** ⬜ Pendente**Ações:**- [ ] Adicionar configuração CORS em `next.config.js`- [ ] Criar variável de ambiente `ALLOWED_ORIGINS` no `.env`- [ ] Configurar headers CORS para rotas `/api/*`:  - [ ] `Access-Control-Allow-Origin`  - [ ] `Access-Control-Allow-Methods`  - [ ] `Access-Control-Allow-Headers`- [ ] Criar middleware OPTIONS para preflight requests (se necessário)**Arquivos a modificar:**- `next.config.js`- `.env` (adicionar `ALLOWED_ORIGINS`)---### ✅ Tarefa 1.4: Validar Paginação na API Pública**Prioridade:** 🔴 CRÍTICA  **Tempo estimado:** 10 minutos  **Status:** ⬜ Pendente**Ações:**- [ ] Modificar `app/api/v1/records/route.ts`- [ ] Adicionar validação de `limit` (máximo 100)- [ ] Adicionar validação de `offset` (mínimo 0)- [ ] Adicionar validação com Zod para garantir tipos corretos**Arquivos a modificar:**- `app/api/v1/records/route.ts`---### ✅ Tarefa 1.5: Corrigir Timezone na API Pública**Prioridade:** 🟡 MÉDIA  **Tempo estimado:** 10 minutos  **Status:** ⬜ Pendente**Ações:**- [ ] Modificar `app/api/v1/records/route.ts`- [ ] Substituir `new Date(validated.date)` por `parseDateString(validated.date)`- [ ] Aplicar em GET e POST**Arquivos a modificar:**- `app/api/v1/records/route.ts`---### ✅ Tarefa 1.6: Validar Tamanho de Arquivo na Importação**Prioridade:** 🟡 MÉDIA  **Tempo estimado:** 15 minutos  **Status:** ⬜ Pendente**Ações:**- [ ] Modificar `app/api/import/route.ts`- [ ] Adicionar validação de tamanho máximo (10MB)- [ ] Retornar erro apropriado se exceder limite- [ ] Adicionar validação de tipo de arquivo (CSV, XLSX)**Arquivos a modificar:**- `app/api/import/route.ts`---## 🎯 FASE 2: PREPARAÇÃO PARA CAPACITOR### ✅ Tarefa 2.1: Instalar Capacitor**Prioridade:** 🟢 BAIXA (após Fase 1)  **Tempo estimado:** 10 minutos  **Status:** ⬜ Pendente**Ações:**- [ ] Instalar dependências:  - [ ] `npm install @capacitor/core @capacitor/cli`  - [ ] `npm install @capacitor/android`- [ ] Verificar instalação: `npx cap --version`**Comandos:**npm install @capacitor/core @capacitor/clinpm install @capacitor/androidnpx cap --version
✅ Tarefa 2.2: Inicializar Capacitor
Prioridade: 🟢 BAIXA
Tempo estimado: 15 minutos
Status: ⬜ Pendente
Ações:
[ ] Executar npx cap init
[ ] Configurar:
[ ] App name: Controle Financeiro Uber
[ ] App ID: com.controlefinanceirouber.app
[ ] Web dir: .next
[ ] Verificar criação de capacitor.config.json
Comandos:
npx cap init
Arquivos a criar:
capacitor.config.json
✅ Tarefa 2.3: Configurar Capacitor para Next.js
Prioridade: 🟢 BAIXA
Tempo estimado: 20 minutos
Status: ⬜ Pendente
Ações:
[ ] Modificar capacitor.config.json:
[ ] Configurar webDir para .next
[ ] Adicionar server.url (desenvolvimento)
[ ] Configurar android.allowMixedContent: true
[ ] Criar script no package.json para build + sync
[ ] Testar build: npm run build && npx cap sync
Arquivos a modificar:
capacitor.config.json
package.json (adicionar script)
Scripts a adicionar:
"cap:sync": "npm run build && npx cap sync","cap:android": "npx cap open android"
✅ Tarefa 2.4: Adicionar Plataforma Android
Prioridade: 🟢 BAIXA
Tempo estimado: 5 minutos
Status: ⬜ Pendente
Ações:
[ ] Executar npx cap add android
[ ] Executar npx cap sync
[ ] Verificar criação da pasta android/
Comandos:
npx cap add androidnpx cap sync
✅ Tarefa 2.5: Configurar Android para Produção
Prioridade: 🟢 BAIXA
Tempo estimado: 30 minutos
Status: ⬜ Pendente
Ações:
[ ] Abrir projeto no Android Studio: npx cap open android
[ ] Configurar build.gradle:
[ ] Versão do app
[ ] Versão do código
[ ] Package name
[ ] Configurar AndroidManifest.xml:
[ ] Permissões necessárias
[ ] Internet permission
[ ] Cleartext traffic (se necessário para desenvolvimento)
[ ] Configurar ícone do app
[ ] Configurar nome do app
Arquivos a modificar:
android/app/build.gradle
android/app/src/main/AndroidManifest.xml
🎯 FASE 3: TESTES E VALIDAÇÃO
✅ Tarefa 3.1: Testar Rate Limiting
Prioridade: 🟡 MÉDIA
Tempo estimado: 20 minutos
Status: ⬜ Pendente
Ações:
[ ] Testar login com múltiplas tentativas
[ ] Verificar bloqueio após limite
[ ] Testar reset do contador após TTL
[ ] Testar em diferentes endpoints
✅ Tarefa 3.2: Testar Headers de Segurança
Prioridade: 🟡 MÉDIA
Tempo estimado: 15 minutos
Status: ⬜ Pendente
Ações:
[ ] Verificar headers nas respostas HTTP
[ ] Testar X-Frame-Options (tentar iframe)
[ ] Verificar X-Content-Type-Options
[ ] Testar Referrer-Policy
Ferramentas:
Browser DevTools (Network tab)
curl ou Postman
✅ Tarefa 3.3: Testar CORS
Prioridade: 🟡 MÉDIA
Tempo estimado: 20 minutos
Status: ⬜ Pendente
Ações:
[ ] Testar requisições de origem permitida
[ ] Testar requisições de origem bloqueada
[ ] Testar preflight OPTIONS
[ ] Testar com app Android (quando disponível)
✅ Tarefa 3.4: Testar API Pública
Prioridade: 🟡 MÉDIA
Tempo estimado: 20 minutos
Status: ⬜ Pendente
Ações:
[ ] Testar paginação com limites válidos
[ ] Testar paginação com limites inválidos
[ ] Testar timezone em datas
[ ] Testar autenticação com API key
✅ Tarefa 3.5: Testar Importação
Prioridade: 🟡 MÉDIA
Tempo estimado: 15 minutos
Status: ⬜ Pendente
Ações:
[ ] Testar upload de arquivo pequeno (< 10MB)
[ ] Testar upload de arquivo grande (> 10MB)
[ ] Testar tipos de arquivo válidos
[ ] Testar tipos de arquivo inválidos
✅ Tarefa 3.6: Testar Build do Next.js
Prioridade: 🟡 MÉDIA
Tempo estimado: 15 minutos
Status: ⬜ Pendente
Ações:
[ ] Executar npm run build
[ ] Verificar se build completa sem erros
[ ] Verificar tamanho dos bundles
[ ] Testar npm run start (produção)
✅ Tarefa 3.7: Testar Capacitor Sync
Prioridade: 🟡 MÉDIA
Tempo estimado: 10 minutos
Status: ⬜ Pendente
Ações:
[ ] Executar npm run cap:sync
[ ] Verificar se arquivos são copiados para android/
[ ] Verificar se não há erros
✅ Tarefa 3.8: Testar App Android (Build)
Prioridade: 🟡 MÉDIA
Tempo estimado: 30 minutos
Status: ⬜ Pendente
Ações:
[ ] Abrir projeto no Android Studio
[ ] Build APK de debug
[ ] Instalar em dispositivo/emulador
[ ] Testar funcionalidades básicas
[ ] Verificar logs de erro
🎯 FASE 4: DOCUMENTAÇÃO E FINALIZAÇÃO
✅ Tarefa 4.1: Documentar Configurações
Prioridade: 🟢 BAIXA
Tempo estimado: 20 minutos
Status: ⬜ Pendente
Ações:
[ ] Criar/atualizar README.md com:
[ ] Instruções de instalação do Capacitor
[ ] Variáveis de ambiente necessárias
[ ] Comandos para build do app
[ ] Configurações de segurança
[ ] Criar SETUP_ANDROID.md com guia passo a passo
Arquivos a criar/modificar:
README.md
SETUP_ANDROID.md (NOVO)
✅ Tarefa 4.2: Atualizar .env.example
Prioridade: 🟢 BAIXA
Tempo estimado: 10 minutos
Status: ⬜ Pendente
Ações:
[ ] Adicionar ALLOWED_ORIGINS no .env.example
[ ] Documentar variáveis necessárias
[ ] Adicionar comentários explicativos
Arquivos a modificar:
.env.example (criar se não existir)
✅ Tarefa 4.3: Criar Checklist de Deploy
Prioridade: 🟢 BAIXA
Tempo estimado: 15 minutos
Status: ⬜ Pendente
Ações:
[ ] Criar checklist de pré-deploy
[ ] Checklist de segurança
[ ] Checklist de build
[ ] Checklist de testes
Arquivos a criar:
DEPLOY_CHECKLIST.md (NOVO)
📊 RESUMO DE PROGRESSO
Fase 1: Correções Críticas
Total de tarefas: 6
Concluídas: 0
Pendentes: 6
Progresso: 0%
Fase 2: Preparação Capacitor
Total de tarefas: 5
Concluídas: 0
Pendentes: 5
Progresso: 0%
Fase 3: Testes
Total de tarefas: 8
Concluídas: 0
Pendentes: 8
Progresso: 0%
Fase 4: Documentação
Total de tarefas: 3
Concluídas: 0
Pendentes: 3
Progresso: 0%
TOTAL GERAL:
Tarefas: 22
Concluídas: 0
Pendentes: 22
Progresso geral: 0%
🚨 ORDEM DE EXECUÇÃO RECOMENDADA
Fase 1.1 → Rate Limiting (CRÍTICO)
Fase 1.2 → Headers de Segurança (CRÍTICO)
Fase 1.3 → CORS (CRÍTICO)
Fase 1.4 → Validação Paginação (CRÍTICO)
Fase 1.5 → Timezone API Pública (MÉDIO)
Fase 1.6 → Validação Arquivo (MÉDIO)
Fase 3.1-3.5 → Testes de Segurança
Fase 2.1-2.5 → Preparação Capacitor
Fase 3.6-3.8 → Testes Capacitor
Fase 4.1-4.3 → Documentação
📝 NOTAS IMPORTANTES
Variáveis de Ambiente Necessárias
ALLOWED_ORIGINS=http://localhost:3000,https://seu-dominio.comNEXTAUTH_SECRET=seu-secret-aquiDATABASE_URL=postgresql://...
Comandos Úteis
# Build e sync Capacitornpm run build && npx cap sync# Abrir Android Studionpx cap open android# Testar buildnpm run buildnpm run start
Dependências a Instalar
npm install lru-cache @types/lru-cachenpm install @capacitor/core @capacitor/clinpm install @capacitor/android
✅ CHECKLIST FINAL (Antes de Publicar)
[ ] Todas as correções críticas implementadas
[ ] Todos os testes passando
[ ] Rate limiting funcionando
[ ] Headers de segurança configurados
[ ] CORS configurado corretamente
[ ] API pública validada
[ ] Build do Next.js funcionando
[ ] Capacitor configurado
[ ] App Android buildando sem erros
[ ] App Android testado em dispositivo
[ ] Documentação atualizada
[ ] Variáveis de ambiente configuradas
[ ] .env.example atualizado
Última atualização: 2026-01-13
Próxima revisão: Após conclusão da Fase 1