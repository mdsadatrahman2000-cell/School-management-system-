import bcrypt from 'bcryptjs';
import { prisma } from '../../index';
import { AppError } from '../../middleware/errorHandler';

interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  schoolId?: string;
}

interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
}

interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  schoolId?: string;
}

export class UserService {
  static async getAll(query: UserQuery) {
    const { page = 1, limit = 10, search, role, schoolId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { profile: { firstName: { contains: search } } },
        { profile: { lastName: { contains: search } } },
      ];
    }
    if (role) where.role = role;
    if (schoolId) where.schoolId = schoolId;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          school: { select: { id: true, name: true } },
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        school: u.school,
        profile: u.profile,
        createdAt: u.createdAt,
      })),
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        school: { select: { id: true, name: true, code: true } },
        student: true,
        teacher: true,
        staff: true,
        guardian: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      school: user.school,
      profile: user.profile,
      student: user.student,
      teacher: user.teacher,
      staff: user.staff,
      guardian: user.guardian,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  static async create(data: CreateUserInput) {
    const { email, password, firstName, lastName, role, phone, schoolId } = data;

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        schoolId,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
          },
        },
      },
      include: {
        profile: true,
        school: { select: { id: true, name: true } },
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      school: user.school,
      profile: user.profile,
      createdAt: user.createdAt,
    };
  }

  static async update(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check email uniqueness if changing
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new AppError(409, 'Email already in use');
      }
    }

    // Update user and profile
    const updated = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        profile: {
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        },
      },
      include: {
        profile: true,
        school: { select: { id: true, name: true } },
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
      school: updated.school,
      profile: updated.profile,
    };
  }

  static async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Prevent deleting self
    if (user.role === 'SUPER_ADMIN') {
      throw new AppError(400, 'Cannot delete super admin');
    }

    await prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  static async updatePassword(id: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  static async getStats() {
    const [total, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    return {
      total,
      byRole: byRole.map(r => ({
        role: r.role,
        count: r._count,
      })),
    };
  }
}
