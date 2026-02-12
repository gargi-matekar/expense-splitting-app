import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import ApiResponse from '../utils/apiResponse';
import { AuthRequest } from '../types/express';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const { user, token } = await authService.register(name, email, password);

      ApiResponse.created(res, 'User registered successfully', {
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, token } = await authService.login(email, password);

      ApiResponse.success(res, 'Login successful', {
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const user = await authService.getUserById(userId);

      ApiResponse.success(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();