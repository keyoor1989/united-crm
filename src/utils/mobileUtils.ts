
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { toast } from 'sonner';

/**
 * Helper to set up mobile-specific enhancements when running in Capacitor
 */
export function setupMobileEnhancements() {
  if (Capacitor.isNativePlatform()) {
    // Add capacitor class to HTML element for mobile-specific styling
    document.documentElement.classList.add('capacitor');
    
    // Handle hardware back button
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // Show confirmation to exit app
        if (confirm('Are you sure you want to exit the app?')) {
          CapacitorApp.exitApp();
        }
      }
    });
    
    // Monitor network status
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed', status);
      if (!status.connected) {
        toast.error('You are currently offline. Some features may be unavailable.');
      } else {
        toast.success('Back online!');
      }
    });
    
    // Prevent default touch behaviors like pull-to-refresh
    document.addEventListener('touchmove', (e) => {
      if (document.documentElement.scrollTop === 0 && e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}
