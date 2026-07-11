import { prisma } from '../../index';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';

interface StudentQuery {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  sectionId?: string;
  schoolId?: string;
}

interface CreateStudentInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  schoolId: string;
  classId?: string;
  sectionId?: string;
  rollNumber?: string;
  bloodGroup?: string;
  medicalInfo?: string;
}

export class StudentService {
  static async getAll(query: StudentQuery) {
    const { page = 1, limit = 10, search, classId, sectionId, schoolId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (schoolId) where.schoolId = schoolId;
    if (search) {
      where.OR = [
        { admissionNumber: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { profile: { firstName: { contains: search } } } },
        { user: { profile: { lastName: { contains: search } } } },
      ];
    }
    if (classId || sectionId) {
      where.enrollments = {
        some: {
          ...(sectionId && { sectionId }),
          ...(classId && { section: { classId } }),
        },
      };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          enrollments: {
            include: {
              section: {
                include: { class: true },
              },
            },
            where: { status: 'ACTIVE' },
            take: 1,
          },
        },
        skip,
        take: parseInt(limit.toString()),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students: students.map(s => ({
        id: s.id,
        userId: s.userId,
        admissionNumber: s.admissionNumber,
        admissionDate: s.admissionDate,
        rollNumber: s.rollNumber,
        bloodGroup: s.bloodGroup,
        email: s.user.email,
        firstName: s.user.profile?.firstName,
        lastName: s.user.profile?.lastName,
        phone: s.user.profile?.phone,
        gender: s.user.profile?.gender,
        dateOfBirth: s.user.profile?.dateOfBirth,
        currentClass: s.enrollments[0]?.section?.class?.name,
        currentSection: s.enrollments[0]?.section?.name,
        enrollmentStatus: s.enrollments[0]?.status,
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
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          include: { profile: true },
        },
        enrollments: {
          include: {
            section: {
              include: { class: true },
            },
            academicYear: true,
            attendance: true,
            examResults: {
              include: { subject: true, exam: true },
            },
          },
        },
        feeAssignments: {
          include: {
            feeStructure: true,
            payments: true,
          },
        },
      },
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    return {
      id: student.id,
      admissionNumber: student.admissionNumber,
      admissionDate: student.admissionDate,
      rollNumber: student.rollNumber,
      bloodGroup: student.bloodGroup,
      medicalInfo: student.medicalInfo,
      transportRoute: student.transportRoute,
      user: {
        id: student.user.id,
        email: student.user.email,
        profile: student.user.profile,
      },
      enrollments: student.enrollments.map(e => ({
        id: e.id,
        status: e.status,
        class: e.section.class.name,
        section: e.section.name,
        academicYear: e.academicYear.name,
        attendanceCount: e.attendance.length,
        examResults: e.examResults,
      })),
      feeSummary: {
        total: student.feeAssignments.reduce((sum, fa) => sum + fa.feeStructure.amount, 0),
        paid: student.feeAssignments.reduce((sum, fa) => 
          sum + fa.payments.reduce((pSum, p) => pSum + p.amount, 0), 0),
        pending: student.feeAssignments
          .filter(fa => fa.status !== 'PAID')
          .reduce((sum, fa) => sum + fa.feeStructure.amount, 0),
      },
    };
  }

  static async create(data: CreateStudentInput) {
    const { email, password, firstName, lastName, dateOfBirth, gender, phone, address, schoolId, classId, sectionId, rollNumber, bloodGroup, medicalInfo } = data;

    // Check email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    // Generate admission number
    const lastStudent = await prisma.student.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const admissionNumber = `SA${String((lastStudent ? parseInt(lastStudent.admissionNumber.replace('SA', '')) : 0) + 1).padStart(4, '0')}`;

    const hashedPassword = await bcrypt.hash(password || 'Student@123', 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        schoolId,
        profile: {
          create: {
            firstName,
            lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender,
            phone,
            address,
          },
        },
        student: {
          create: {
            admissionNumber,
            admissionDate: new Date(),
            rollNumber,
            bloodGroup,
            medicalInfo,
            schoolId,
          },
        },
      },
      include: {
        profile: true,
        student: true,
      },
    });

    // Auto-enroll if classId and sectionId provided
    if (classId && sectionId && user.student) {
      const academicYear = await prisma.academicYear.findFirst({
        where: { schoolId, isCurrent: true },
      });
      if (academicYear) {
        await prisma.enrollment.create({
          data: {
            studentId: user.student.id,
            sectionId,
            academicYearId: academicYear.id,
            status: 'ACTIVE',
          },
        });
      }
    }

    return {
      id: user.student?.id,
      userId: user.id,
      admissionNumber,
      email: user.email,
      profile: user.profile,
    };
  }

  static async getStats(schoolId?: string) {
    const where = schoolId ? { schoolId } : {};
    
    const [total, active, byClass] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.count({
        where: {
          ...where,
          enrollments: { some: { status: 'ACTIVE' } },
        },
      }),
      prisma.enrollment.groupBy({
        by: ['sectionId'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),
    ]);

    return { total, active, inactive: total - active };
  }
}
