import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';
import { messageProducer } from '../lib/kafka';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User ${socket.data.user.username} connected`);

    // Join room
    socket.on('join-room', async (data: { roomId: string }) => {
      try {
        const { roomId } = data;
        const userId = socket.data.user.id;

        // Verify user is a member of the room
        const membership = await prisma.roomMember.findUnique({
          where: {
            userId_roomId: {
              userId,
              roomId
            }
          }
        });

        if (!membership) {
          socket.emit('error', { message: 'You are not a member of this room' });
          return;
        }

        socket.join(roomId);
        socket.emit('joined-room', { roomId });
        
        // Notify other users in the room
        socket.to(roomId).emit('user-joined', {
          user: {
            id: socket.data.user.id,
            username: socket.data.user.username,
            avatar: socket.data.user.avatar
          }
        });

        console.log(`User ${socket.data.user.username} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave-room', (data: { roomId: string }) => {
      const { roomId } = data;
      socket.leave(roomId);
      socket.emit('left-room', { roomId });
      
      socket.to(roomId).emit('user-left', {
        user: {
          id: socket.data.user.id,
          username: socket.data.user.username
        }
      });

      console.log(`User ${socket.data.user.username} left room ${roomId}`);
    });

    // Send message
    socket.on('send-message', async (data: {
      roomId: string;
      content: string;
      type?: 'TEXT' | 'IMAGE' | 'FILE';
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      try {
        const { roomId, content, type = 'TEXT', fileUrl, fileName, fileSize } = data;
        const userId = socket.data.user.id;

        // Verify user is a member of the room
        const membership = await prisma.roomMember.findUnique({
          where: {
            userId_roomId: {
              userId,
              roomId
            }
          }
        });

        if (!membership) {
          socket.emit('error', { message: 'You are not a member of this room' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            content,
            type,
            fileUrl,
            fileName,
            fileSize,
            userId,
            roomId
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        });

        // Emit message to room
        io.to(roomId).emit('new-message', message);

        // Send to Kafka for event processing
        await messageProducer.send({
          topic: 'message-events',
          messages: [{
            key: roomId,
            value: JSON.stringify({
              type: 'MESSAGE_CREATED',
              messageId: message.id,
              roomId,
              userId,
              content,
              timestamp: new Date().toISOString()
            })
          }]
        });

        console.log(`Message sent in room ${roomId} by ${socket.data.user.username}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
      const { roomId, isTyping } = data;
      
      if (isTyping) {
        socket.to(roomId).emit('user-typing', {
          userId: socket.data.user.id,
          username: socket.data.user.username,
          isTyping: true
        });
      } else {
        socket.to(roomId).emit('user-typing', {
          userId: socket.data.user.id,
          username: socket.data.user.username,
          isTyping: false
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.data.user.username} disconnected`);
    });
  });
};
