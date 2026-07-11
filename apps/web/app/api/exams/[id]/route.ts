import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'])
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        results: {
          include: {
            enrollment: { include: { student: { include: { user: { include: { profile: true } } } } } },
            subject: true,
          },
        },
      },
    })
    if (!exam) return notFoundResponse('Exam not found')
    return successResponse(exam)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    const { name, type, startDate, endDate, isActive } = await req.json()

    const exam = await prisma.exam.update({
      where: { id: params.id },
      data: {
        name, type, isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    })

    return successResponse(exam)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    await prisma.exam.delete({ where: { id: params.id } })
    return successResponse({ message: 'Exam deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
