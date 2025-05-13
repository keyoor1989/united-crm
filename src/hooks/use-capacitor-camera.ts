
import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { isCapacitorEnvironment } from '@/utils/mobileCompatibility';
import { toast } from '@/hooks/use-toast';

interface CameraOptions {
  quality?: number; // 0-100
  allowEditing?: boolean;
  source?: CameraSource;
  resultType?: CameraResultType;
  width?: number;
  height?: number;
  promptLabelHeader?: string;
  promptLabelCancel?: string;
}

export function useCapacitorCamera(defaultOptions?: CameraOptions) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const defaultCameraOptions: CameraOptions = {
    quality: 90,
    allowEditing: true,
    source: CameraSource.Prompt,
    resultType: CameraResultType.Uri,
    promptLabelHeader: 'Select Image Source',
    promptLabelCancel: 'Cancel',
    ...defaultOptions
  };

  const takePhoto = useCallback(async (options?: CameraOptions) => {
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
      
      // Take the picture
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
