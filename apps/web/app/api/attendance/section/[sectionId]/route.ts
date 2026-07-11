import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { sectionId: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'])
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const enrollments = await prisma.enrollment.findMany({
      where: { sectionId: params.sectionId, status: 'ACTIVE' },
      include: {
        student: { include: { user: { include: { profile: true } } } },
        attendance: { where: { date: new Date(date) } },
      },
    })

    const result = enrollments.map(e => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      firstName: e.student.user.profile?.firstName,
      lastName: e.student.user.profile?.lastName,
      admissionNumber: e.student.admissionNumber,
      attendance: e.attendance[0] || null,
    }))

    return successResponse({ date, sectionId: params.sectionId, students: result })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
