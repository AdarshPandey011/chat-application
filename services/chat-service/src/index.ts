import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { prisma } from './lib/prisma';
import { kafka } from './lib/kafka';
import { setupSocketHandlers } from './socket/handlers';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import roomRoutes from './routes/rooms';
import messageRoutes from './routes/messages';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Routes
app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'chat-service' });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  await kafka.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  await kafka.disconnect();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`🚀 Chat service running on port ${PORT}`);
});
