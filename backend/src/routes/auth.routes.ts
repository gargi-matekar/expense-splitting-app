import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { registerValidator, loginValidator } from '../validations/auth.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerValidator), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginValidator), authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;