import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/express';
import ApiError from '../utils/apiError';
import jwtConfig from '../config/jwt';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as {
        userId: string;
        email: string;
      };

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };

      next();
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

export default authenticate;