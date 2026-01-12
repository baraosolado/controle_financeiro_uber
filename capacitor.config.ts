import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.controlefinanceirouber.app',
  appName: 'Controle Financeiro Uber',
  webDir: '.next',
  server: {
    // Para desenvolvimento local, usar IP da máquina
    // Para produção, remover esta configuração ou usar URL do servidor
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000',
    cleartext: true, // Permitir HTTP em desenvolvimento
  },
  android: {
    allowMixedContent: true, // Permitir conteúdo misto (HTTP/HTTPS)
  },
};

export default config;
