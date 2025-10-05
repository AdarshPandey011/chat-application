import express from 'express';
import Joi from 'joi';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  avatar: Joi.string().uri()
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res, next) => {
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
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), async (req, res, next) => {
  try {
    const { username, firstName, lastName, avatar } = req.body;

    // Check if username is taken
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: req.user?.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Username is already taken'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: {
        ...(username && { username }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Search users
router.get('/search', authMiddleware, async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.user?.id } }, // Exclude current user
          {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true
      },
      take: 10
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
