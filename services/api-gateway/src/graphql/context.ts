import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Context {
  req: Request;
  res: Response;
  user?: User;
}

export const context = async ({ req }: { req: Request }): Promise<Context> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { req };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Verify user with auth service
    try {
      const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return {
        req,
        res: req.res,
        user: response.data.user
      };
    } catch (error) {
      console.error('Failed to verify user with auth service:', error);
      return { req };
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return { req };
  }
};
