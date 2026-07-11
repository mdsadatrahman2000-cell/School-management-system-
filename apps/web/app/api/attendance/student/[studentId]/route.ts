import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    requireAuth(req)
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const student = await prisma.student.findUnique({ where: { id: params.studentId } })
    if (!student) return errorResponse('Student not found', 404)

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: params.studentId },
      include: {
        attendance: {
          where: startDate && endDate ? {
            date: { gte: new Date(startDate), lte: new Date(endDate) },
          } : undefined,
          orderBy: { date: 'desc' },
        },
        section: true,
        academicYear: true,
      },
    })

    const allAttendance = enrollments.flatMap(e => e.attendance)
    return successResponse(allAttendance)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    return errorResponse('Internal server error', 500)
  }
}
