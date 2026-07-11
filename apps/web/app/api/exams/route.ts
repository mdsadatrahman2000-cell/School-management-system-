import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'])
    const { searchParams } = new URL(req.url)
    const schoolId = searchParams.get('schoolId') || ''
    const academicYearId = searchParams.get('academicYearId') || ''

    const where: any = {}
    if (schoolId) where.schoolId = schoolId
    if (academicYearId) where.academicYearId = academicYearId

    const exams = await prisma.exam.findMany({
      where,
      include: { results: true },
      orderBy: { startDate: 'desc' },
    })

    return successResponse(exams)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    const { name, type, schoolId, academicYearId, startDate, endDate } = await req.json()

    const exam = await prisma.exam.create({
      data: {
        name, type, schoolId, academicYearId,
        startDate: new Date(startDate), endDate: new Date(endDate),
      },
    })

    return successResponse(exam, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
