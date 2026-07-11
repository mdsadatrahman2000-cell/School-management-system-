import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'])
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const schoolId = searchParams.get('schoolId') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (schoolId) where.schoolId = schoolId
    if (search) {
      where.OR = [
        { user: { profile: { firstName: { contains: search } } } },
        { user: { profile: { lastName: { contains: search } } } },
        { admissionNumber: { contains: search } },
      ]
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { include: { profile: true } },
          enrollments: { include: { section: { include: { class: true } } } },
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ])

    return successResponse({
      students: students.map(s => {
        const currentEnrollment = s.enrollments?.[0]
        return {
          id: s.id,
          admissionNumber: s.admissionNumber,
          firstName: s.user.profile?.firstName,
          lastName: s.user.profile?.lastName,
          email: s.user.email,
          className: currentEnrollment?.section?.class?.name,
          sectionName: currentEnrollment?.section?.name,
          status: currentEnrollment?.status || 'ACTIVE',
        }
      }),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'STAFF'])
    const { userId, schoolId, admissionNumber, admissionDate, rollNumber } = await req.json()

    const student = await prisma.student.create({
      data: {
        userId, schoolId, admissionNumber,
        admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        rollNumber,
      },
      include: { user: { include: { profile: true } } },
    })

    return successResponse({
      id: student.id,
      admissionNumber: student.admissionNumber,
      firstName: student.user.profile?.firstName,
      lastName: student.user.profile?.lastName,
    }, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
