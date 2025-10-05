import express from 'express';
import Joi from 'joi';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation schemas
const createMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  type: Joi.string().valid('TEXT', 'IMAGE', 'FILE').default('TEXT'),
  fileUrl: Joi.string().uri(),
  fileName: Joi.string(),
  fileSize: Joi.number().positive()
});

// Get messages for a room
router.get('/room/:roomId', authMiddleware, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?.id;

    // Verify user is a member of the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: userId!,
          roomId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.message.count({
      where: { roomId }
    });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create message (alternative to Socket.IO)
router.post('/', authMiddleware, validateRequest(createMessageSchema), async (req, res, next) => {
  try {
    const { content, type, fileUrl, fileName, fileSize, roomId } = req.body;
    const userId = req.user?.id;

    // Verify user is a member of the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: userId!,
          roomId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        userId: userId!,
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

    res.status(201).json({
      message: 'Message created successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the message author or admin of the room
    if (message.userId !== userId) {
      const membership = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: userId!,
            roomId: message.roomId
          }
        }
      });

      if (!membership || membership.role !== 'ADMIN') {
        return res.status(403).json({ error: 'You can only delete your own messages' });
      }
    }

    await prisma.message.delete({
      where: { id }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Update message
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only the message author can edit
    if (message.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content },
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

    res.json({
      message: 'Message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    next(error);
  }
});

export default router;
