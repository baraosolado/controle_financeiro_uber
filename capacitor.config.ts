import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.controlefinanceirouber.app',
  appName: 'Controle Financeiro Uber',
  // App funcional: conecta ao servidor Next.js em tempo real
  // Não é estático - todas as funcionalidades funcionam normalmente
  webDir: 'public',
  server: {
    // PRODUÇÃO: URL do seu servidor Next.js em produção
    url: process.env.CAPACITOR_SERVER_URL || 'https://dbpostgress-uber.llppfo.easypanel.host/',
    cleartext: false, // HTTPS em produção
  },
  android: {
    allowMixedContent: false, // Não permitir conteúdo misto em produção
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD,
    },
  },
};

export default config;
