import twilio from 'twilio';
import { notificationProducer } from '../lib/kafka';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMSNotification(notification: any) {
  try {
    console.log('Sending SMS notification:', notification.type);

    const message = {
      body: getSMSBody(notification),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: notification.phoneNumber,
    };

    // In production, you would send the actual SMS
    // await client.messages.create(message);
    
    console.log('SMS notification payload:', message);

    // Send to Kafka for tracking
    await notificationProducer.send({
      topic: 'sms-notifications',
      messages: [{
        key: notification.phoneNumber,
        value: JSON.stringify({
          type: 'SMS_NOTIFICATION_SENT',
          notification,
          timestamp: new Date().toISOString()
        })
      }]
    });

    return true;
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    return false;
  }
}

function getSMSBody(notification: any): string {
  switch (notification.type) {
    case 'NEW_MESSAGE':
      return `ChatApp: New message - ${notification.content || 'You have a new message'}`;
    case 'MESSAGE_UPDATED':
      return 'ChatApp: A message was updated';
    case 'MESSAGE_DELETED':
      return 'ChatApp: A message was deleted';
    case 'WELCOME':
      return `Welcome to ChatApp, ${notification.username}! Start chatting now.`;
    default:
      return 'ChatApp: You have a new notification';
  }
}
