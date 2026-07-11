import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { profile: true, school: { select: { id: true, name: true } } },
    })
    if (!user) return notFoundResponse('User not found')
    return successResponse({
      id: user.id, email: user.email, role: user.role, isActive: user.isActive,
      school: user.school, profile: user.profile,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    const { email, firstName, lastName, role, isActive, phone } = await req.json()

    const existing = await prisma.user.findUnique({ where: { id: params.id } })
    if (!existing) return notFoundResponse('User not found')

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        email, role, isActive,
        profile: { update: { firstName, lastName, phone } },
      },
      include: { profile: true, school: { select: { id: true, name: true } } },
    })

    return successResponse({
      id: updated.id, email: updated.email, role: updated.role, isActive: updated.isActive,
      school: updated.school, profile: updated.profile,
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
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return notFoundResponse('User not found')
    await prisma.user.delete({ where: { id: params.id } })
    return successResponse({ message: 'User deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
