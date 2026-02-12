import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export {};