
import { useEffect, useState } from 'react';
import { 
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { toast } from "sonner";

export const usePushNotifications = () => {
  const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);

  useEffect(() => {
    const addListeners = async () => {
      await PushNotifications.addListener('registration', token => {
        console.log('Push registration success:', token.value);
      });

      await PushNotifications.addListener('registrationError', err => {
        console.error('Push registration failed:', err.error);
      });

      await PushNotifications.addListener(
        'pushNotificationReceived',
        notification => {
          console.log('Push notification received:', notification);
          setNotifications(notifications => [...notifications, notification]);
          
          // Show toast notification
          toast(notification.title, {
            description: notification.body,
          });
        },
      );

      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          console.log('Push action performed:', notification.actionId);
        },
      );
    };

    const registerNotifications = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('User denied push notification permissions');
        return;
      }

      await PushNotifications.register();
    };

    addListeners();
    registerNotifications();
  }, []);

  return { notifications };
};
