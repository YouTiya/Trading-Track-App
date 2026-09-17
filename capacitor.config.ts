import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradingtrack.app',
  appName: 'Trading Track',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#0b0f17',
    allowMixedContent: true
  }
};

export default config;
