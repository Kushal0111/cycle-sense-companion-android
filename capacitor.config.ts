
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.6381d4c7caf848a891a74f0fd9254730',
  appName: 'cycle-sense-companion-android',
  webDir: 'dist',
  server: {
    url: 'https://6381d4c7-caf8-48a8-91a7-4f0fd9254730.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
