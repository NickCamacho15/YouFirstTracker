import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.youfirst.tracker',
  appName: 'YouFirst Tracker',
  webDir: 'dist/public',
  // Production configuration - no server block needed for production/TestFlight
  // Uncomment for development:
  /*
  server: {
    androidScheme: 'https',
    url: 'http://192.168.227.222:3000',
    hostname: '192.168.227.222',
    cleartext: true
  }
  */
};

export default config;
