import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.youfirst.tracker',
  appName: 'YouFirst Tracker',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'http://192.168.1.190:3000',
    hostname: '192.168.1.190',
    // Handle API requests by allowing cleartext for development
    cleartext: true
  }
};

export default config;
