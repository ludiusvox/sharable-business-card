import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.sovereign.card',
  appName: 'Sovereign ID',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
