import { prisma } from '../../index';
import { AppError } from '../../middleware/errorHandler';

interface CreateExamInput {
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  schoolId: string;
  academicYearId: string;
}

interface AddResultInput {
  examId: string;
  enrollmentId: string;
  subjectId: string;
  marks: number;
  totalMarks?: number;
  grade?: string;
  remarks?: string;
}

interface BulkResultInput {
  examId: string;
  results: {
    enrollmentId: string;
    subjectId: string;
    marks: number;
    totalMarks?: number;
    grade?: string;
    remarks?: string;
  }[];
}

export class ExamService {
  static async getAll(schoolId?: string, academicYearId?: string) {
    const where: any = {};
    if (schoolId) where.schoolId = schoolId;
    if (academicYearId) where.academicYearId = academicYearId;

    const exams = await prisma.exam.findMany({
      where,
      include: {
        academicYear: true,
        _count: { select: { results: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return exams;
  }

  static async getById(id: string) {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        academicYear: true,
        school: true,
        results: {
          include: {
            enrollment: {
              include: {
                student: {
                  include: { user: { include: { profile: true } } },
                },
                section: { include: { class: true } },
              },
            },
            subject: true,
          },
        },
      },
    });

    if (!exam) {
      throw new AppError(404, 'Exam not found');
    }

    return exam;
  }

  static async create(data: CreateExamInput) {
    const exam = await prisma.exam.create({
      data: {
        name: data.name,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        schoolId: data.schoolId,
        academicYearId: data.academicYearId,
      },
    });
    return exam;
  }

  static async addResult(data: AddResultInput) {
    const { examId, enrollmentId, subjectId, marks, totalMarks = 100, grade, remarks } = data;

    // Check if result exists
    const existing = await prisma.examResult.findUnique({
      where: { examId_enrollmentId_subjectId: { examId, enrollmentId, subjectId } },
    });

    if (existing) {
      // Update
      const updated = await prisma.examResult.update({
        where: { id: existing.id },
        data: { marks, totalMarks, grade, remarks },
      });
      return updated;
    }

    // Create
    const result = await prisma.examResult.create({
      data: {
        examId,
        enrollmentId,
        subjectId,
        marks,
        totalMarks,
        grade,
        remarks,
      },
    });

    return result;
  }

  static async bulkAddResults(data: BulkResultInput) {
    const results = [];
    for (const item of data.results) {
      const result = await this.addResult({
        examId: data.examId,
        ...item,
      });
      results.push(result);
    }
    return { added: results.length, results };
  }

  static async getResults(examId: string, sectionId?: string) {
    const where: any = { examId };
    if (sectionId) {
      where.enrollment = { sectionId };
    }

    const results = await prisma.examResult.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: {
              include: { user: { include: { profile: true } } },
            },
            section: { include: { class: true } },
          },
        },
        subject: true,
        exam: true,
      },
      orderBy: [
        { enrollment: { student: { rollNumber: 'asc' } } },
        { subject: { name: 'asc' } },
      ],
    });

    // Group by student
    const byStudent = results.reduce((acc: any, r) => {
      const studentId = r.enrollment.studentId;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: {
            id: r.enrollment.student.id,
            name: `${r.enrollment.student.user.profile?.firstName} ${r.enrollment.student.user.profile?.lastName}`,
            rollNumber: r.enrollment.student.rollNumber,
          },
          results: [],
          totalMarks: 0,
          obtainedMarks: 0,
        };
      }
      acc[studentId].results.push({
        subject: r.subject.name,
        marks: r.marks,
        totalMarks: r.totalMarks,
        grade: r.grade,
        remarks: r.remarks,
      });
      acc[studentId].totalMarks += r.totalMarks;
      acc[studentId].obtainedMarks += r.marks;
      return acc;
    }, {});

    return Object.values(byStudent);
  }

  static async getReportCard(studentId: string, academicYearId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, academicYearId },
      include: {
        section: { include: { class: true } },
        examResults: {
          include: {
            exam: true,
            subject: true,
          },
        },
      },
    });

    return enrollments.map(e => ({
      class: e.section.class.name,
      section: e.section.name,
      exams: e.examResults.reduce((acc: any, r) => {
        if (!acc[r.examId]) {
          acc[r.examId] = {
            exam: r.exam.name,
            type: r.exam.type,
            results: [],
          };
        }
        acc[r.examId].results.push({
          subject: r.subject.name,
          marks: r.marks,
          totalMarks: r.totalMarks,
          grade: r.grade,
        });
        return acc;
      }, {}),
    }));
  }
}
