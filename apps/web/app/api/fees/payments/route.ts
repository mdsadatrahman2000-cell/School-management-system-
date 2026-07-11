import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'STAFF', 'FINANCE'])
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId') || ''

    const where: any = {}
    if (studentId) where.feeAssignment = { studentId }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        feeAssignment: {
          include: {
            student: { include: { user: { include: { profile: true } } } },
            feeStructure: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    return successResponse(payments)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'STAFF', 'FINANCE'])
    const { feeAssignmentId, amount, paymentMethod, transactionId, notes } = await req.json()

    const payment = await prisma.payment.create({
      data: {
        feeAssignmentId, amount, paymentMethod, transactionId, notes,
        receivedBy: 'current-user',
      },
    })

    const totalPaid = await prisma.payment.aggregate({
      where: { feeAssignmentId },
      _sum: { amount: true },
    })

    const assignment = await prisma.feeAssignment.findUnique({ where: { id: feeAssignmentId } })
    const feeStructure = assignment ? await prisma.feeStructure.findUnique({ where: { id: assignment.feeStructureId } }) : null

    if (assignment && feeStructure && totalPaid._sum.amount && totalPaid._sum.amount >= feeStructure.amount) {
      await prisma.feeAssignment.update({ where: { id: feeAssignmentId }, data: { status: 'PAID' } })
    } else if (totalPaid._sum.amount && totalPaid._sum.amount > 0) {
      await prisma.feeAssignment.update({ where: { id: feeAssignmentId }, data: { status: 'PARTIAL' } })
    }

    return successResponse(payment, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
