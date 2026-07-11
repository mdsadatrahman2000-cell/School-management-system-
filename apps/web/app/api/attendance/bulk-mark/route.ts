import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'])
    const { date, records } = await req.json()

    const results = await Promise.all(
      records.map((r: any) =>
        prisma.attendance.upsert({
          where: { enrollmentId_date: { enrollmentId: r.enrollmentId, date: new Date(date) } },
          update: { status: r.status, remarks: r.remarks, markedBy: 'current-user' },
          create: { enrollmentId: r.enrollmentId, date: new Date(date), status: r.status, remarks: r.remarks, markedBy: 'current-user' },
        })
      )
    )

    return successResponse({ count: results.length })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
