import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const unreadOnly = searchParams.get('unread') === 'true'

  const where: any = { userId: user.id }
  if (unreadOnly) where.isRead = false

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ])

  return apiSuccess({ items, total, unreadCount, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { ids, all } = await req.json()

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })
  } else if (ids?.length) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { isRead: true },
    })
  }

  return apiSuccess(null, '已标记为已读')
}
