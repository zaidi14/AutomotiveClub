import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register the device for push notifications and save the token in Firestore.
 */
export async function registerForPushNotifications(userId) {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: '80074bf5-7e6e-40d4-8159-3a83bfc28aa6',
      })
    ).data;

    // Save token to user's Firestore document
    if (userId && token) {
      await updateDoc(doc(db, 'users', userId), { pushToken: token });
    }

    // Android needs a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D32F2F',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Send push notifications to all users (except the sender).
 * Called from admin actions (create event / create news).
 */
export async function sendPushToAllUsers(title, body, excludeUserId, extraData = {}) {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const tokens = [];

    usersSnapshot.forEach((userDoc) => {
      const data = userDoc.data();
      if (data.pushToken && userDoc.id !== excludeUserId) {
        tokens.push(data.pushToken);
      }
    });

    if (tokens.length === 0) return;

    // Expo Push API supports up to 100 per request
    const chunks = [];
    for (let i = 0; i < tokens.length; i += 100) {
      chunks.push(tokens.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      const messages = chunk.map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: { type: 'notification', ...extraData },
      }));

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    }
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
}
