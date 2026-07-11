import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'STAFF', 'FINANCE'])
    const { searchParams } = new URL(req.url)
    const schoolId = searchParams.get('schoolId') || ''

    const where: any = {}
    if (schoolId) where.schoolId = schoolId

    const structures = await prisma.feeStructure.findMany({
      where,
      include: { assignments: true },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(structures)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'FINANCE'])
    const { name, description, schoolId, amount, frequency, classId } = await req.json()

    const structure = await prisma.feeStructure.create({
      data: { name, description, schoolId, amount, frequency, classId },
    })

    return successResponse(structure, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
