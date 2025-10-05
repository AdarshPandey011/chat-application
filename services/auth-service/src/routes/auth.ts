import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { prisma } from '../lib/prisma';
import { generateToken } from '../config/passport';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Input validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// User registration endpoint
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Check if user already exists (by email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    // Hash the password before storing in database
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user record
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        provider: 'local'
      }
    });

    // Generate JWT token for authentication
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login endpoint
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.provider !== 'local') {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // For now, we'll implement password verification later
    // This is a placeholder for the password verification logic
    
    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
