
import { useState, useEffect } from 'react';
import { isCapacitorEnvironment } from '@/utils/mobileCompatibility';
import { toast } from '@/hooks/use-toast';

// Updated interface to match the actual plugin API
interface BiometricPluginResult {
  isAvailable: boolean;
  has?: { 
    face: boolean;
    fingerprint: boolean;
    iris: boolean;
  };
}

interface BiometricVerifyResult {
  verified: boolean;
}

interface BiometricCredentials {
  username: string;
  password: string;
}

interface NativeBiometricPlugin {
  isAvailable(): Promise<BiometricPluginResult>;
  verifyIdentity(options?: { reason?: string; title?: string; subtitle?: string; description?: string }): Promise<BiometricVerifyResult>;
  setCredentials(options: { username: string; password: string; server: string }): Promise<void>;
  getCredentials(options: { server: string }): Promise<BiometricCredentials>;
  deleteCredentials(options: { server: string }): Promise<void>;
}

// This will get set once the plugin is imported dynamically
let NativeBiometric: NativeBiometricPlugin | null = null;

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<{ 
    face: boolean;
    fingerprint: boolean;
    iris: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamically import the plugin to avoid issues on web
  useEffect(() => {
    const loadPlugin = async () => {
      if (isCapacitorEnvironment()) {
        try {
          // Dynamic import of the plugin
          const module = await import('capacitor-native-biometric');
          NativeBiometric = module.NativeBiometric as NativeBiometricPlugin;
          
          // Check if biometrics is available
          const result = await NativeBiometric.isAvailable();
          setIsAvailable(result.isAvailable);
          if (result.has) {
            setBiometricType(result.has);
          }
        } catch (err) {
          console.error('Failed to load biometric plugin:', err);
          setError('Biometric authentication not available');
          setIsAvailable(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setIsAvailable(false);
      }
    };
    
    loadPlugin();
  }, []);

  /**
   * Authenticate with biometrics
   */
  const authenticate = async (options?: {
    reason?: string;
    title?: string;
    subtitle?: string;
  }): Promise<boolean> => {
    setError(null);
    
    if (!isCapacitorEnvironment() || !isAvailable || !NativeBiometric) {
      setError('Biometric authentication not available');
      return false;
    }
    
    try {
      const result = await NativeBiometric.verifyIdentity({
        reason: options?.reason || 'For secure access to your account',
        title: options?.title || 'Biometric Authentication',
        subtitle: options?.subtitle || 'Verify your identity',
        description: 'Complete biometric authentication to continue',
      });
      
      return result.verified;
    } catch (err) {
      console.error('Biometric authentication failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      
      // User canceled authentication
      if (err instanceof Error && err.message.includes('cancel')) {
        toast({
          title: "Authentication Canceled",
          description: "Biometric verification was canceled"
        });
        return false;
      }
      
      // Failed authentication
      toast({
        title: "Authentication Failed",
        description: "Could not verify biometric identity",
        variant: "destructive"
      });
      
      return false;
    }
  };

  /**
   * Save credentials associated with biometric authentication
   */
  const saveCredentials = async (
    username: string,
    password: string,
    serverName: string
  ): Promise<boolean> => {
    if (!isCapacitorEnvironment() || !isAvailable || !NativeBiometric) {
      setError('Biometric authentication not available');
      return false;
    }
    
    try {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: serverName,
      });
      return true;
    } catch (err) {
      console.error('Failed to save credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to save credentials');
      return false;
    }
  };

  /**
   * Retrieve credentials associated with biometric authentication
   */
  const getCredentials = async (serverName: string): Promise<{
    username: string;
    password: string;
  } | null> => {
    if (!isCapacitorEnvironment() || !isAvailable || !NativeBiometric) {
      setError('Biometric authentication not available');
      return null;
    }
    
    try {
      // First verify the user's identity
      const { verified } = await NativeBiometric.verifyIdentity({
        reason: "Access your login credentials",
        title: "Biometric Authentication",
      });
      
      if (verified) {
        // Then get the credentials
        return await NativeBiometric.getCredentials({
          server: serverName,
        });
      }
      
      return null;
    } catch (err) {
      console.error('Failed to get credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to get credentials');
      return null;
    }
  };

  /**
   * Delete stored credentials
   */
  const deleteCredentials = async (serverName: string): Promise<boolean> => {
    if (!isCapacitorEnvironment() || !isAvailable || !NativeBiometric) {
      setError('Biometric authentication not available');
      return false;
    }
    
    try {
      await NativeBiometric.deleteCredentials({
        server: serverName,
      });
      return true;
    } catch (err) {
      console.error('Failed to delete credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete credentials');
      return false;
    }
  };

  return {
    isAvailable,
    biometricType,
    isLoading,
    error,
    authenticate,
    saveCredentials,
    getCredentials,
    deleteCredentials,
  };
}
