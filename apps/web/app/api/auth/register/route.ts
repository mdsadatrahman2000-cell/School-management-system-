import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, signRefreshToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, role = 'STUDENT', schoolId } = await req.json()

    if (!email || !password || !firstName || !lastName) {
      return errorResponse('Missing required fields')
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return errorResponse('Email already registered', 409)

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        schoolId,
        profile: {
          create: { firstName, lastName },
        },
      },
      include: {
        profile: true,
        school: { select: { id: true, name: true } },
      },
    })

    const accessToken = signToken({ id: user.id, email: user.email, role: user.role, schoolId: user.schoolId })
    const refreshToken = signRefreshToken({ id: user.id })

    return successResponse({
      user: { id: user.id, email: user.email, role: user.role, profile: user.profile },
      accessToken,
      refreshToken,
    }, 201)
  } catch (error) {
    console.error('Register error:', error)
    return errorResponse('Internal server error', 500)
  }
}
