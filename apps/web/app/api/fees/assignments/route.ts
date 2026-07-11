import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'STAFF', 'FINANCE'])
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId') || ''
    const status = searchParams.get('status') || ''

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (status) where.status = status

    const assignments = await prisma.feeAssignment.findMany({
      where,
      include: {
        student: { include: { user: { include: { profile: true } } } },
        feeStructure: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(assignments)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'STAFF'])
    const { studentId, feeStructureId, dueDate } = await req.json()

    const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } })
    if (!feeStructure) return errorResponse('Fee structure not found', 404)

    const assignment = await prisma.feeAssignment.create({
      data: { studentId, feeStructureId, dueDate: new Date(dueDate) },
      include: { feeStructure: true, student: { include: { user: { include: { profile: true } } } } },
    })

    return successResponse(assignment, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
