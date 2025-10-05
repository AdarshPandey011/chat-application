import { messageConsumer, userConsumer, notificationProducer } from '../lib/kafka';
import { sendPushNotification } from '../services/pushNotification';
import { sendEmailNotification } from '../services/emailNotification';
import { sendSMSNotification } from '../services/smsNotification';

export function setupEventHandlers() {
  // Handle message events
  messageConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value?.toString() || '{}');
        
        switch (event.type) {
          case 'MESSAGE_CREATED':
            await handleMessageCreated(event);
            break;
          case 'MESSAGE_UPDATED':
            await handleMessageUpdated(event);
            break;
          case 'MESSAGE_DELETED':
            await handleMessageDeleted(event);
            break;
          default:
            console.log('Unknown message event type:', event.type);
        }
      } catch (error) {
        console.error('Error processing message event:', error);
      }
    },
  });

  // Handle user events
  userConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value?.toString() || '{}');
        
        switch (event.type) {
          case 'USER_REGISTERED':
            await handleUserRegistered(event);
            break;
          case 'USER_UPDATED':
            await handleUserUpdated(event);
            break;
          case 'USER_LOGGED_IN':
            await handleUserLoggedIn(event);
            break;
          default:
            console.log('Unknown user event type:', event.type);
        }
      } catch (error) {
        console.error('Error processing user event:', error);
      }
    },
  });
}

// Message event handlers
async function handleMessageCreated(event: any) {
  console.log('Processing message created event:', event);
  
  // Send notifications to room members who are not the sender
  const notification = {
    type: 'NEW_MESSAGE',
    roomId: event.roomId,
    messageId: event.messageId,
    senderId: event.userId,
    content: event.content,
    timestamp: event.timestamp
  };

  // Send push notification
  await sendPushNotification(notification);
  
  // Send email notification for offline users
  await sendEmailNotification(notification);
}

async function handleMessageUpdated(event: any) {
  console.log('Processing message updated event:', event);
  
  const notification = {
    type: 'MESSAGE_UPDATED',
    roomId: event.roomId,
    messageId: event.messageId,
    senderId: event.userId,
    content: event.content,
    timestamp: event.timestamp
  };

  await sendPushNotification(notification);
}

async function handleMessageDeleted(event: any) {
  console.log('Processing message deleted event:', event);
  
  const notification = {
    type: 'MESSAGE_DELETED',
    roomId: event.roomId,
    messageId: event.messageId,
    senderId: event.userId,
    timestamp: event.timestamp
  };

  await sendPushNotification(notification);
}

// User event handlers
async function handleUserRegistered(event: any) {
  console.log('Processing user registered event:', event);
  
  // Send welcome email
  await sendEmailNotification({
    type: 'WELCOME',
    userId: event.userId,
    email: event.email,
    username: event.username
  });
}

async function handleUserUpdated(event: any) {
  console.log('Processing user updated event:', event);
  
  // Handle profile updates, etc.
  const notification = {
    type: 'PROFILE_UPDATED',
    userId: event.userId,
    changes: event.changes,
    timestamp: event.timestamp
  };

  await sendPushNotification(notification);
}

async function handleUserLoggedIn(event: any) {
  console.log('Processing user logged in event:', event);
  
  // Update user status, send login notifications, etc.
  const notification = {
    type: 'USER_ONLINE',
    userId: event.userId,
    timestamp: event.timestamp
  };

  await sendPushNotification(notification);
}
