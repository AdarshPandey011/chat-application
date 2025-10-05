import admin from 'firebase-admin';
import { notificationProducer } from '../lib/kafka';

// Initialize Firebase Admin (you would need to add your service account key)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

export async function sendPushNotification(notification: any) {
  try {
    console.log('Sending push notification:', notification);

    // In a real implementation, you would:
    // 1. Get user's FCM tokens from database
    // 2. Send push notification using Firebase Admin SDK
    // 3. Handle token refresh and cleanup

    const message = {
      notification: {
        title: getNotificationTitle(notification.type),
        body: getNotificationBody(notification),
      },
      data: {
        type: notification.type,
        roomId: notification.roomId || '',
        messageId: notification.messageId || '',
        timestamp: notification.timestamp || new Date().toISOString(),
      },
      // token: userToken, // User's FCM token
    };

    // Simulate sending notification
    console.log('Push notification payload:', message);

    // Send to Kafka for further processing
    await notificationProducer.send({
      topic: 'push-notifications',
      messages: [{
        key: notification.roomId || notification.userId,
        value: JSON.stringify({
          type: 'PUSH_NOTIFICATION_SENT',
          notification,
          timestamp: new Date().toISOString()
        })
      }]
    });

    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'NEW_MESSAGE':
      return 'New Message';
    case 'MESSAGE_UPDATED':
      return 'Message Updated';
    case 'MESSAGE_DELETED':
      return 'Message Deleted';
    case 'USER_ONLINE':
      return 'User Online';
    case 'PROFILE_UPDATED':
      return 'Profile Updated';
    default:
      return 'ChatApp Notification';
  }
}

function getNotificationBody(notification: any): string {
  switch (notification.type) {
    case 'NEW_MESSAGE':
      return notification.content || 'You have a new message';
    case 'MESSAGE_UPDATED':
      return 'A message was updated';
    case 'MESSAGE_DELETED':
      return 'A message was deleted';
    case 'USER_ONLINE':
      return 'A user came online';
    case 'PROFILE_UPDATED':
      return 'Profile was updated';
    default:
      return 'You have a new notification';
  }
}
