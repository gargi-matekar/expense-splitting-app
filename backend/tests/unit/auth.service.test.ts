import authService from '../../src/services/auth.service';
import User from '../../src/models/User';
import ApiError from '../../src/utils/apiError';

jest.mock('../../src/models/User');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register(
        'Test User',
        'test@example.com',
        'password123'
      );

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw error if user already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

      await expect(
        authService.register('Test User', 'test@example.com', 'password123')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('login', () => {
    it('should successfully login a user with correct credentials', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedpassword',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(ApiError);
    });
  });
});