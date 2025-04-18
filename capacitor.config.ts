
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5bc22deeb5134bb08c85f6d387c3a3bc',
  appName: 'united-crm',
  webDir: 'dist',
  server: {
    url: 'https://5bc22dee-b513-4bb0-8c85-f6d387c3a3bc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
