import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'

export async function POST(req: NextRequest, { params }: { params: { examId: string } }) {
  try {
    requireRole(req, ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'])
    const { enrollmentId, subjectId, marks, totalMarks, remarks } = await req.json()

    const exam = await prisma.exam.findUnique({ where: { id: params.examId } })
    if (!exam) return errorResponse('Exam not found', 404)

    const percentage = (marks / (totalMarks || 100)) * 100
    const grade = calculateGrade(percentage)

    const result = await prisma.examResult.upsert({
      where: { examId_enrollmentId_subjectId: { examId: params.examId, enrollmentId, subjectId } },
      update: { marks, totalMarks, grade, remarks },
      create: { examId: params.examId, enrollmentId, subjectId, marks, totalMarks, grade, remarks },
    })

    return successResponse(result, 201)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse()
    if (error.message === 'Forbidden') return forbiddenResponse()
    return errorResponse('Internal server error', 500)
  }
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 40) return 'D'
  return 'F'
}
