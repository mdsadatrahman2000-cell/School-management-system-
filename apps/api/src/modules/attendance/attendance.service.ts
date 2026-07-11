import { prisma } from '../../index';
import { AppError } from '../../middleware/errorHandler';

interface MarkAttendanceInput {
  enrollmentId: string;
  date: string;
  status: string;
  remarks?: string;
  markedBy: string;
}

interface BulkAttendanceInput {
  enrollments: { enrollmentId: string; status: string; remarks?: string }[];
  date: string;
  markedBy: string;
}

interface AttendanceQuery {
  sectionId?: string;
  classId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  studentId?: string;
}

export class AttendanceService {
  static async mark(data: MarkAttendanceInput) {
    const { enrollmentId, date, status, remarks, markedBy } = data;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) {
      throw new AppError(404, 'Enrollment not found');
    }

    const attendanceDate = new Date(date);

    // Check if already marked
    const existing = await prisma.attendance.findUnique({
      where: { enrollmentId_date: { enrollmentId, date: attendanceDate } },
    });

    if (existing) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status, remarks, markedBy },
      });
      return updated;
    }

    // Create new attendance
    const attendance = await prisma.attendance.create({
      data: {
        enrollmentId,
        date: attendanceDate,
        status,
        remarks,
        markedBy,
      },
    });

    return attendance;
  }

  static async bulkMark(data: BulkAttendanceInput) {
    const { enrollments, date, markedBy } = data;
    const attendanceDate = new Date(date);

    const results = [];
    for (const item of enrollments) {
      const result = await this.mark({
        enrollmentId: item.enrollmentId,
        date,
        status: item.status,
        remarks: item.remarks,
        markedBy,
      });
      results.push(result);
    }

    return { marked: results.length, records: results };
  }

  static async getBySection(sectionId: string, date: string) {
    const attendanceDate = new Date(date);

    const enrollments = await prisma.enrollment.findMany({
      where: { sectionId, status: 'ACTIVE' },
      include: {
        student: {
          include: {
            user: { include: { profile: true } },
          },
        },
        attendance: {
          where: { date: attendanceDate },
          take: 1,
        },
      },
      orderBy: {
        student: { rollNumber: 'asc' },
      },
    });

    return enrollments.map(e => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      rollNumber: e.student.rollNumber,
      name: `${e.student.user.profile?.firstName} ${e.student.user.profile?.lastName}`,
      email: e.student.user.email,
      attendance: e.attendance[0] || null,
      status: e.attendance[0]?.status || 'NOT_MARKED',
    }));
  }

  static async getByStudent(studentId: string, startDate?: string, endDate?: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    const where: any = {
      enrollment: { studentId },
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        enrollment: {
          include: {
            section: { include: { class: true } },
            academicYear: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      excused: attendance.filter(a => a.status === 'EXCUSED').length,
    };

    return {
      attendance,
      stats,
      percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    };
  }

  static async getStats(sectionId?: string, academicYearId?: string) {
    const where: any = {};
    if (sectionId) where.enrollment = { sectionId };
    if (academicYearId) where.enrollment = { ...where.enrollment, academicYearId };

    const [total, byStatus] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count,
        percentage: total > 0 ? Math.round((s._count / total) * 100) : 0,
      })),
    };
  }
}
