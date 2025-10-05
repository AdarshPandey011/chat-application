import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import dotenv from 'dotenv';
import passport from 'passport';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import './config/passport';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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

// Session configuration
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
});
