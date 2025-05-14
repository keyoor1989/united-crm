
import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { isCapacitorEnvironment } from '@/utils/mobileCompatibility';
import { toast } from '@/hooks/use-toast';

// Define the interface to match Capacitor's ImageOptions
interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  source?: CameraSource;
  resultType: CameraResultType; // Now required to match ImageOptions
  width?: number;
  height?: number;
  promptLabelHeader?: string;
  promptLabelCancel?: string;
}

export function useCapacitorCamera(defaultOptions?: Partial<CameraOptions>) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set default options with resultType now required
  const defaultCameraOptions: CameraOptions = {
    quality: 90,
    allowEditing: true,
    source: CameraSource.Prompt,
    resultType: CameraResultType.Uri, // This is now required
    promptLabelHeader: 'Select Image Source',
    promptLabelCancel: 'Cancel',
    ...defaultOptions
  };

  const takePhoto = useCallback(async (options?: Partial<CameraOptions>) => {
    if (!isCapacitorEnvironment()) {
      toast({
        title: "Native Camera Unavailable",
        description: "This feature requires running on a mobile device",
        variant: "destructive"
      });
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Request camera permissions
      const permissionStatus = await Camera.checkPermissions();
      
      if (permissionStatus.camera !== 'granted') {
        const requestedPermissions = await Camera.requestPermissions();
        if (requestedPermissions.camera !== 'granted') {
          throw new Error('Camera permission not granted');
        }
      }
      
      // Take the picture with merged options, ensuring resultType is always present
      const photo = await Camera.getPhoto({
        ...defaultCameraOptions,
        ...options
      });
      
      setPhotos(prevPhotos => [...prevPhotos, photo]);
      return photo;
    } catch (err) {
      console.error('Camera error:', err);
      setError(err instanceof Error ? err.message : 'Failed to take photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultCameraOptions]);

  const clearPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  return {
    photos,
    takePhoto,
    clearPhotos,
    isLoading,
    error
  };
}
