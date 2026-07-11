import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'])
    const { enrollmentId, date, status, remarks } = await req.json()

    const attendance = await prisma.attendance.upsert({
      where: { enrollmentId_date: { enrollmentId, date: new Date(date) } },
      update: { status, remarks, markedBy: 'current-user' },
      create: { enrollmentId, date: new Date(date), status, remarks, markedBy: 'current-user' },
    })

    return successResponse(attendance, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
