import { prisma } from '../../index';
import { AppError } from '../../middleware/errorHandler';

interface CreateFeeStructureInput {
  name: string;
  description?: string;
  amount: number;
  frequency: string;
  classId?: string;
  schoolId: string;
}

interface AssignFeeInput {
  feeStructureId: string;
  studentId: string;
  dueDate: string;
}

interface RecordPaymentInput {
  feeAssignmentId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber?: string;
  notes?: string;
  receivedBy: string;
}

export class FeeService {
  static async getStructures(schoolId?: string) {
    const where = schoolId ? { schoolId } : {};
    const structures = await prisma.feeStructure.findMany({
      where,
      include: {
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return structures;
  }

  static async createStructure(data: CreateFeeStructureInput) {
    const structure = await prisma.feeStructure.create({
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        frequency: data.frequency,
        classId: data.classId,
        schoolId: data.schoolId,
      },
    });
    return structure;
  }

  static async assignFee(data: AssignFeeInput) {
    const assignment = await prisma.feeAssignment.create({
      data: {
        feeStructureId: data.feeStructureId,
        studentId: data.studentId,
        dueDate: new Date(data.dueDate),
      },
      include: {
        feeStructure: true,
        student: {
          include: { user: { include: { profile: true } } },
        },
      },
    });
    return assignment;
  }

  static async getAssignments(studentId?: string, status?: string) {
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const assignments = await prisma.feeAssignment.findMany({
      where,
      include: {
        feeStructure: true,
        student: {
          include: {
            user: { include: { profile: true } },
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'desc' },
    });

    return assignments.map(a => ({
      ...a,
      totalPaid: a.payments.reduce((sum, p) => sum + p.amount, 0),
      remaining: a.feeStructure.amount - a.payments.reduce((sum, p) => sum + p.amount, 0),
    }));
  }

  static async recordPayment(data: RecordPaymentInput) {
    const assignment = await prisma.feeAssignment.findUnique({
      where: { id: data.feeAssignmentId },
      include: { feeStructure: true, payments: true },
    });

    if (!assignment) {
      throw new AppError(404, 'Fee assignment not found');
    }

    const totalPaid = assignment.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid + data.amount > assignment.feeStructure.amount) {
      throw new AppError(400, 'Payment exceeds total fee amount');
    }

    const payment = await prisma.payment.create({
      data: {
        feeAssignmentId: data.feeAssignmentId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        receiptNumber: data.receiptNumber,
        notes: data.notes,
        receivedBy: data.receivedBy,
      },
    });

    // Update assignment status
    const newTotal = totalPaid + data.amount;
    const status = newTotal >= assignment.feeStructure.amount ? 'PAID' : 'PARTIAL';
    await prisma.feeAssignment.update({
      where: { id: data.feeAssignmentId },
      data: { status },
    });

    return payment;
  }

  static async getPayments(feeAssignmentId?: string) {
    const where = feeAssignmentId ? { feeAssignmentId } : {};
    const payments = await prisma.payment.findMany({
      where,
      include: {
        feeAssignment: {
          include: {
            feeStructure: true,
            student: {
              include: { user: { include: { profile: true } } },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
    return payments;
  }

  static async getStats(schoolId?: string) {
    const where: any = {};
    if (schoolId) {
      where.feeStructure = { schoolId };
    }

    const [totalFees, totalPaid, pendingCount] = await Promise.all([
      prisma.feeAssignment.aggregate({
        where,
        _sum: { feeStructure: { select: { amount: true } } },
      }),
      prisma.payment.aggregate({
        where: { feeAssignment: where },
        _sum: { amount: true },
      }),
      prisma.feeAssignment.count({
        where: { ...where, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
      }),
    ]);

    return {
      totalFees: totalFees._sum.feeStructure?.amount || 0,
      totalPaid: totalPaid._sum.amount || 0,
      pending: pendingCount,
    };
  }
}
