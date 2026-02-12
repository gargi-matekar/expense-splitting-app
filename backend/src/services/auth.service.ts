import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { IUserDocument } from '../models/User';
import ApiError from '../utils/apiError';
import jwtConfig from '../config/jwt';

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email);

    return { user, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; token: string }> {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user._id.toString(), user.email);

    // Remove password from user object
    user.password = undefined as any;

    return { user, token };
  }

  async getUserById(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  private generateToken(userId: string, email: string): string {
    const secret = jwtConfig.secret as Secret;
    const expiresIn = jwtConfig.expiresIn as SignOptions['expiresIn'];

    return jwt.sign({ userId, email }, secret, { expiresIn });
  }
}

export default new AuthService();