
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { isCapacitorEnvironment } from '@/utils/mobileCompatibility';
import { toast } from '@/hooks/use-toast';

type BackButtonOptions = {
  preventExit?: boolean;
  exitMessage?: string;
  canGoBack?: boolean;
  customAction?: () => boolean | void; // Return true to prevent default behavior
};

export function useAndroidBackButton(options: BackButtonOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    preventExit = false,
    exitMessage = 'Press back again to exit',
    canGoBack: canGoBackOption,
    customAction
  } = options;

  useEffect(() => {
    let lastBackPressTime = 0;
    const DOUBLE_PRESS_DELAY = 2000; // ms
    
    if (!isCapacitorEnvironment()) {
      return;
    }
    
    const handleBackButton = App.addListener('backButton', ({ canGoBack }) => {
      // If a custom action is provided, execute it first
      if (customAction) {
        const result = customAction();
        // If custom action returns true, stop here
        if (result === true) {
          return;
        }
      }
      
      // Determine if we can go back (use option if provided, otherwise use Capacitor's value)
      const shouldGoBack = canGoBackOption !== undefined ? canGoBackOption : canGoBack;
      
      // If we can go back in history, do so
      if (shouldGoBack && location.pathname !== '/') {
        navigate(-1);
        return;
      }
      
      // If on the home route and preventExit is true, show confirmation
      if (preventExit) {
        const now = new Date().getTime();
        
        if (now - lastBackPressTime < DOUBLE_PRESS_DELAY) {
          // User pressed back twice quickly, exit the app
          App.exitApp();
        } else {
          // First press, show message
          lastBackPressTime = now;
          toast({
            title: exitMessage,
            duration: DOUBLE_PRESS_DELAY,
          });
        }
      } else {
        // No prevention, exit immediately
        App.exitApp();
      }
    });
    
    // Clean up listener when component unmounts
    return () => {
      handleBackButton.remove();
    };
  }, [navigate, location.pathname, customAction, preventExit, exitMessage, canGoBackOption]);

  // Return nothing as this is just a side effect hook
  return null;
}
