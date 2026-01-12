# 🔧 Troubleshooting - Erro de Build no Docker

## Problema: `npm run build` ou `npx next build` falha com exit code 1

### Solução 1: Usar Dockerfile.debug (Recomendado)

O `Dockerfile.debug` mostra logs detalhados do erro. Configure no EasyPanel:

1. **No EasyPanel**, altere o **Dockerfile Path** para: `Dockerfile.debug`
2. Faça o deploy novamente
3. Os logs mostrarão exatamente onde está falhando

### Solução 2: Verificar Erros Comuns

#### Erro de TypeScript
- Verifique se há erros de tipo no código
- Execute localmente: `npm run build` para ver os erros
- Corrija os erros antes de fazer deploy

#### Erro de Dependências
- Verifique se todas as dependências estão no `package.json`
- Execute: `npm install` localmente para verificar

#### Erro de Prisma
- Verifique se o schema do Prisma está correto
- Execute: `npx prisma generate` localmente

#### Erro de Memória
- O build pode estar consumindo muita memória
- Tente aumentar os recursos do container no EasyPanel

### Solução 3: Build Local para Testar

Teste o build localmente antes de fazer deploy:

```bash
# 1. Instalar dependências
npm install

# 2. Gerar Prisma Client
npx prisma generate

# 3. Fazer build
npm run build
```

Se funcionar localmente mas falhar no Docker, o problema pode ser:
- Variáveis de ambiente faltando
- Dependências nativas não instaladas
- Problemas de permissão

### Solução 4: Verificar Logs do EasyPanel

No EasyPanel:
1. Vá em "Logs" do projeto
2. Veja os logs completos do build
3. Procure por mensagens de erro específicas

### Solução 5: Usar Dockerfile.alternative

Se o Dockerfile principal continuar falhando:

1. **No EasyPanel**, altere o **Dockerfile Path** para: `Dockerfile.alternative`
2. Este é uma versão simplificada que pode funcionar melhor

### Erros Comuns e Soluções

#### "Cannot find module"
- **Causa**: Dependência não instalada
- **Solução**: Verifique `package.json` e `package-lock.json`

#### "Type error"
- **Causa**: Erro de TypeScript
- **Solução**: Corrija os erros de tipo no código

#### "Prisma Client not generated"
- **Causa**: Prisma não foi gerado corretamente
- **Solução**: Verifique se `npx prisma generate` está sendo executado

#### "Out of memory"
- **Causa**: Build consumindo muita memória
- **Solução**: Aumente os recursos do container ou otimize o build

### Próximos Passos

1. ✅ Use `Dockerfile.debug` para ver os erros detalhados
2. ✅ Teste o build localmente: `npm run build`
3. ✅ Verifique os logs no EasyPanel
4. ✅ Se necessário, use `Dockerfile.alternative`

### Contato

Se o problema persistir, compartilhe:
- Logs completos do build (do EasyPanel ou Dockerfile.debug)
- Erro específico que aparece
- Se o build funciona localmente
