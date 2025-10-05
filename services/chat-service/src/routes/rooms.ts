import express from 'express';
import Joi from 'joi';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation schemas
const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500),
  type: Joi.string().valid('DIRECT', 'GROUP').default('GROUP'),
  memberIds: Joi.array().items(Joi.string()).min(1).required()
});

const updateRoomSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(500),
  avatar: Joi.string().uri()
});

// Create room
router.post('/', authMiddleware, validateRequest(createRoomSchema), async (req, res, next) => {
  try {
    const { name, description, type, memberIds } = req.body;
    const userId = req.user?.id;

    // Create room
    const room = await prisma.room.create({
      data: {
        name,
        description,
        type,
        creatorId: userId!,
        members: {
          create: [
            // Add creator as admin
            { userId: userId!, role: 'ADMIN' },
            // Add other members
            ...memberIds.map((memberId: string) => ({
              userId: memberId,
              role: 'MEMBER'
            }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    next(error);
  }
});

// Get user's rooms
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json({ rooms });
  } catch (error) {
    next(error);
  }
});

// Get room by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const room = await prisma.room.findFirst({
      where: {
        id,
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
});

// Update room
router.put('/:id', authMiddleware, validateRequest(updateRoomSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if user is admin of the room
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: userId!,
          roomId: id
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only room admins can update the room' });
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: req.body,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Room updated successfully',
      room: updatedRoom
    });
  } catch (error) {
    next(error);
  }
});

// Add member to room
router.post('/:id/members', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user?.id;

    // Check if current user is admin
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: currentUserId!,
          roomId: id
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only room admins can add members' });
    }

    // Add member
    await prisma.roomMember.create({
      data: {
        userId,
        roomId: id,
        role: 'MEMBER'
      }
    });

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User is already a member of this room' });
    }
    next(error);
  }
});

// Remove member from room
router.delete('/:id/members/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user?.id;

    // Check if current user is admin or removing themselves
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: currentUserId!,
          roomId: id
        }
      }
    });

    if (!membership || (membership.role !== 'ADMIN' && currentUserId !== userId)) {
      return res.status(403).json({ error: 'Unauthorized to remove this member' });
    }

    await prisma.roomMember.delete({
      where: {
        userId_roomId: {
          userId,
          roomId: id
        }
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
