import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin, apiSuccess, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '50')
  const userId = searchParams.get('userId')
  const ip = searchParams.get('ip')

  const where: any = {}
  if (userId) where.userId = userId
  if (ip) where.ip = { contains: ip }

  const [items, total] = await Promise.all([
    prisma.loginLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, username: true, nickname: true, avatar: true, role: true } },
      },
    }),
    prisma.loginLog.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}
