import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, signRefreshToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return errorResponse('Email and password are required')
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        school: { select: { id: true, name: true, code: true } },
      },
    })

    if (!user) return errorResponse('Invalid email or password', 401)
    if (!user.isActive) return errorResponse('Account is deactivated', 403)

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return errorResponse('Invalid email or password', 401)

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    const accessToken = signToken({ id: user.id, email: user.email, role: user.role, schoolId: user.schoolId })
    const refreshToken = signRefreshToken({ id: user.id })

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        school: user.school,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}
