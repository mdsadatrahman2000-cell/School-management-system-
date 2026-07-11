import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'])
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        user: { include: { profile: true } },
        enrollments: { include: { section: { include: { class: true } }, academicYear: true } },
      },
    })
    if (!student) return notFoundResponse('Student not found')

    const currentEnrollment = student.enrollments?.[0]
    return successResponse({
      id: student.id,
      admissionNumber: student.admissionNumber,
      firstName: student.user.profile?.firstName,
      lastName: student.user.profile?.lastName,
      email: student.user.email,
      className: currentEnrollment?.section?.class?.name,
      sectionName: currentEnrollment?.section?.name,
      academicYear: currentEnrollment?.academicYear?.name,
      status: currentEnrollment?.status || 'ACTIVE',
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'STAFF'])
    const { rollNumber, bloodGroup, medicalInfo, transportRoute } = await req.json()

    const student = await prisma.student.update({
      where: { id: params.id },
      data: { rollNumber, bloodGroup, medicalInfo, transportRoute },
      include: { user: { include: { profile: true } } },
    })

    return successResponse({
      id: student.id,
      admissionNumber: student.admissionNumber,
      firstName: student.user.profile?.firstName,
      lastName: student.user.profile?.lastName,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    const student = await prisma.student.findUnique({ where: { id: params.id } })
    if (!student) return notFoundResponse('Student not found')
    await prisma.student.delete({ where: { id: params.id } })
    return successResponse({ message: 'Student deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
