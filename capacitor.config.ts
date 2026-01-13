import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.controlefinanceirouber.app',
  appName: 'Controle Financeiro Uber',
  // App funcional: conecta ao servidor Next.js em tempo real
  // Não é estático - todas as funcionalidades funcionam normalmente
  webDir: 'public',
  server: {
    // PRODUÇÃO: URL do seu servidor Next.js em produção
    // Exemplo: https://controle-financeiro-uber.com
    // DESENVOLVIMENTO: IP da sua máquina na rede local
    // Exemplo: http://192.168.1.100:3000
    // O app Android se conecta a este servidor e funciona normalmente
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000',
    cleartext: process.env.NODE_ENV === 'development', // HTTP apenas em desenvolvimento
  },
  android: {
    allowMixedContent: process.env.NODE_ENV === 'development',
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD,
    },
  },
};

export default config;
