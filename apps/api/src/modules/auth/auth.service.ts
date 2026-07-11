import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index';
import { AppError } from '../../middleware/errorHandler';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  schoolId?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterInput) {
    const { email, password, firstName, lastName, role = 'STUDENT', schoolId } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as any,
        schoolId,
        profile: {
          create: {
            firstName,
            lastName
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      ...tokens
    };
  }

  static async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      ...tokens
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET + '-refresh' || 'default-refresh-secret'
      ) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { profile: true }
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        school: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      school: user.school,
      profile: user.profile
    };
  }

  private static generateTokens(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET + '-refresh' || 'default-refresh-secret',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}
