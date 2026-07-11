import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'school-mgmt-super-secret-key-2024'

export interface JWTPayload {
  id: string
  email: string
  role: string
  schoolId?: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function signRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, JWT_SECRET + '-refresh', { expiresIn: '30d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, JWT_SECRET + '-refresh') as { id: string }
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.split(' ')[1]
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = getUserFromRequest(req)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export function requireRole(req: NextRequest, roles: string[]): JWTPayload {
  const user = requireAuth(req)
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}
