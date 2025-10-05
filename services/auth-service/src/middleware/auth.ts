import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { prisma } from '../lib/prisma';

// Extend Express Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

// Middleware to authenticate JWT tokens
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and has Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    // Verify token using passport JWT strategy
    passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Attach user info to request object
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username
      };
      next();
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
        if (!err && user) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username
          };
        }
        next();
      })(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};
