import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        school: { select: { id: true, name: true, code: true } },
      },
    })

    if (!profile) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      school: profile.school,
      profile: profile.profile,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Internal server error', 500)
  }
}
