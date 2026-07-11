import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const user = requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { profile: { firstName: { contains: search } } },
        { profile: { lastName: { contains: search } } },
      ]
    }
    if (role) where.role = role

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true, school: { select: { id: true, name: true } } },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return successResponse({
      users: users.map(u => ({
        id: u.id, email: u.email, role: u.role, isActive: u.isActive,
        school: u.school, profile: u.profile, createdAt: u.createdAt,
      })),
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
    const user = requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL'])
    const { email, password, firstName, lastName, role, phone, schoolId } = await req.json()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return errorResponse('Email already registered', 409)

    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        email, password: hashedPassword, role, schoolId,
        profile: { create: { firstName, lastName, phone } },
      },
      include: { profile: true, school: { select: { id: true, name: true } } },
    })

    return successResponse({
      id: newUser.id, email: newUser.email, role: newUser.role,
      school: newUser.school, profile: newUser.profile,
    }, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}
