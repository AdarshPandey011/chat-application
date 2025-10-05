import nodemailer from 'nodemailer';
import { notificationProducer } from '../lib/kafka';

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailNotification(notification: any) {
  try {
    console.log('Sending email notification:', notification.type);

    const mailOptions = {
      from: process.env.SMTP_FROM || 'ChatApp <noreply@chatapp.com>',
      to: notification.email,
      subject: getEmailSubject(notification.type),
      html: getEmailTemplate(notification),
    };

    // In production, you would send the actual email
    // await transporter.sendMail(mailOptions);
    
    console.log('Email notification payload:', mailOptions);

    // Send to Kafka for tracking
    await notificationProducer.send({
      topic: 'email-notifications',
      messages: [{
        key: notification.userId || notification.email,
        value: JSON.stringify({
          type: 'EMAIL_NOTIFICATION_SENT',
          notification,
          timestamp: new Date().toISOString()
        })
      }]
    });

    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'WELCOME':
      return 'Welcome to ChatApp!';
    case 'NEW_MESSAGE':
      return 'You have new messages in ChatApp';
    case 'MESSAGE_UPDATED':
      return 'Message updated in ChatApp';
    case 'MESSAGE_DELETED':
      return 'Message deleted in ChatApp';
    default:
      return 'ChatApp Notification';
  }
}

function getEmailTemplate(notification: any): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ChatApp Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ChatApp</h1>
        </div>
        <div class="content">
          ${getEmailContent(notification)}
        </div>
        <div class="footer">
          <p>This is an automated message from ChatApp. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseTemplate;
}

function getEmailContent(notification: any): string {
  switch (notification.type) {
    case 'WELCOME':
      return `
        <h2>Welcome to ChatApp!</h2>
        <p>Hi ${notification.username},</p>
        <p>Welcome to ChatApp! We're excited to have you join our community.</p>
        <p>You can now start chatting with your friends and colleagues in real-time.</p>
        <a href="${process.env.FRONTEND_URL}/chat" class="button">Start Chatting</a>
      `;
    
    case 'NEW_MESSAGE':
      return `
        <h2>New Message</h2>
        <p>You have received a new message in one of your chat rooms.</p>
        <p><strong>Message:</strong> ${notification.content || 'You have a new message'}</p>
        <a href="${process.env.FRONTEND_URL}/chat" class="button">View Message</a>
      `;
    
    case 'MESSAGE_UPDATED':
      return `
        <h2>Message Updated</h2>
        <p>A message has been updated in one of your chat rooms.</p>
        <a href="${process.env.FRONTEND_URL}/chat" class="button">View Chat</a>
      `;
    
    case 'MESSAGE_DELETED':
      return `
        <h2>Message Deleted</h2>
        <p>A message has been deleted in one of your chat rooms.</p>
        <a href="${process.env.FRONTEND_URL}/chat" class="button">View Chat</a>
      `;
    
    default:
      return `
        <h2>ChatApp Notification</h2>
        <p>You have a new notification from ChatApp.</p>
        <a href="${process.env.FRONTEND_URL}" class="button">View App</a>
      `;
  }
}
