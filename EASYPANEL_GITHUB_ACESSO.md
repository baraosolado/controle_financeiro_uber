# 🔐 Configurar Acesso ao GitHub no EasyPanel

## Erro: "Cannot find public repository and your Github token is invalid"

Este erro ocorre quando o EasyPanel não consegue acessar seu repositório GitHub.

### Soluções

#### Solução 1: Tornar o Repositório Público (Mais Simples)

1. Acesse: https://github.com/baraosolado/controle_financeiro_uber
2. Vá em **Settings** (Configurações)
3. Role até **Danger Zone**
4. Clique em **Change visibility** → **Make public**
5. Confirme a ação

**Vantagens:**
- ✅ Não precisa configurar token
- ✅ Funciona imediatamente
- ✅ EasyPanel acessa sem autenticação

**Desvantagens:**
- ⚠️ Código fica público (mas não há dados sensíveis no código)

#### Solução 2: Configurar Token do GitHub (Para Repositório Privado)

Se você quiser manter o repositório privado:

1. **Criar Personal Access Token no GitHub:**
   - Acesse: https://github.com/settings/tokens
   - Clique em **Generate new token** → **Generate new token (classic)**
   - Nome: `EasyPanel Access`
   - Permissões necessárias:
     - ✅ `repo` (acesso completo a repositórios)
     - ✅ `read:packages` (se usar packages privados)
   - Clique em **Generate token**
   - **COPIE O TOKEN** (você só verá uma vez!)

2. **Configurar Token no EasyPanel:**
   - No EasyPanel, vá em **Settings** ou **Configurações**
   - Procure por **GitHub Integration** ou **Source Control**
   - Adicione o token do GitHub
   - Salve as configurações

3. **Configurar o Projeto:**
   - No projeto, configure:
     - **Repository URL:** `https://github.com/baraosolado/controle_financeiro_uber.git`
     - **Branch:** `main`
     - O EasyPanel agora usará o token para acessar

#### Solução 3: Usar SSH (Alternativa)

Se o EasyPanel suportar SSH:

1. **Gerar chave SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "easypanel@example.com"
   ```

2. **Adicionar chave pública ao GitHub:**
   - Copie o conteúdo de `~/.ssh/id_ed25519.pub`
   - No GitHub: Settings → SSH and GPG keys → New SSH key
   - Cole a chave pública

3. **Configurar no EasyPanel:**
   - Use a URL SSH: `git@github.com:baraosolado/controle_financeiro_uber.git`
   - Configure a chave privada no EasyPanel

### Verificar se o Repositório Está Acessível

Teste se o repositório está acessível:

```bash
# Teste público (sem autenticação)
curl https://github.com/baraosolado/controle_financeiro_uber

# Se retornar HTML, está acessível
# Se retornar 404, o repositório está privado
```

### Recomendação

**Para desenvolvimento/teste:** Use a **Solução 1** (repositório público)
- Mais simples
- Funciona imediatamente
- Não há dados sensíveis no código (variáveis de ambiente ficam no EasyPanel)

**Para produção:** Use a **Solução 2** (token do GitHub)
- Mantém o código privado
- Mais seguro
- Requer configuração adicional

### Após Configurar

1. ✅ Repositório público OU token configurado
2. ✅ No EasyPanel, configure:
   - **Repository URL:** `https://github.com/baraosolado/controle_financeiro_uber.git`
   - **Branch:** `main`
3. ✅ Tente fazer o deploy novamente

### Troubleshooting

**Erro persiste após tornar público:**
- Aguarde alguns minutos (pode levar tempo para propagar)
- Verifique se a URL está correta
- Tente fazer o deploy novamente

**Erro com token:**
- Verifique se o token tem permissão `repo`
- Verifique se o token não expirou
- Tente gerar um novo token

**Erro 404:**
- Verifique se o repositório existe
- Verifique se o nome do usuário está correto: `baraosolado`
- Verifique se o nome do repositório está correto: `controle_financeiro_uber`
