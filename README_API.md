# 📚 Documentação da API REST

## Acesso à Documentação Swagger

A documentação completa da API está disponível em `/docs` e é **restrita apenas para desenvolvedores**.

### Como Configurar Acesso

1. **Adicione seu email nas variáveis de ambiente:**

```env
# .env ou .env.local
DEV_EMAIL_1=seu-email@example.com
DEV_EMAIL_2=outro-dev@example.com
NEXT_PUBLIC_DEV_EMAIL_1=seu-email@example.com
NEXT_PUBLIC_DEV_EMAIL_2=outro-dev@example.com
```

2. **Faça login na aplicação** com uma conta que tenha o email configurado

3. **Acesse `/docs`** no navegador

### Segurança

- ✅ Autenticação obrigatória (NextAuth.js)
- ✅ Verificação de email de desenvolvedor
- ✅ Proteção no endpoint `/api/swagger.json`
- ✅ Página não indexada pelos buscadores

### Endpoints Documentados

A documentação Swagger inclui:

- **Autenticação**: Registro, login, recuperação de senha
- **Registros**: CRUD completo de registros financeiros
- **Combustível**: Gerenciamento de abastecimentos
- **Manutenção**: Gerenciamento de manutenções
- **Metas**: Sistema de metas financeiras
- **Alertas**: Sistema de alertas inteligentes
- **Dashboard**: Estatísticas e métricas
- **Exportação**: CSV, Excel, PDF
- **Importação**: Upload de planilhas
- **Relatórios**: Relatórios fiscais para IR
- **Plataformas**: Comparação de plataformas
- **API Pública**: Endpoints com autenticação por API key

### Autenticação

#### Para Usuários (Bearer Token)
A maioria dos endpoints requer autenticação via JWT do NextAuth.js:

```
Authorization: Bearer <token>
```

#### Para API Pública (API Key)
Alguns endpoints públicos usam API key:

```
X-API-Key: <sua-api-key>
```

### Rate Limiting

Os endpoints têm rate limiting configurado:

- **Registro**: 3 requisições/minuto
- **Recuperação de senha**: 3 requisições/minuto
- **Registros**: 20 requisições/minuto
- **API Pública**: 50 requisições/minuto
- **Importação**: 5 requisições/minuto

### Exemplos de Uso

Consulte a documentação Swagger em `/docs` para exemplos completos de requisições e respostas.
