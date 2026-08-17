import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '50')
  const action = searchParams.get('action')
  const userId = searchParams.get('userId')
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  const where: any = {}
  if (action) where.action = action
  if (userId) where.userId = userId
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  const [items, total] = await Promise.all([
    prisma.operationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, username: true, nickname: true, role: true } } },
    }),
    prisma.operationLog.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}
