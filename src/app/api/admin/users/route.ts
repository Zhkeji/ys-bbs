import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
  } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('q')
  const role = searchParams.get('role')
  const status = searchParams.get('status')

  const where: any = {}
  if (search) where.OR = [{ username: { contains: search } }, { email: { contains: search } }, { nickname: { contains: search } }]
  if (role) where.role = role
  if (status) where.status = status

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, username: true, email: true, nickname: true, avatar: true,
        role: true, title: true, points: true, level: true, postCount: true,
        commentCount: true, isBanned: true, isMuted: true, status: true,
        lastLoginAt: true, lastLoginIp: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin()
  } catch { return apiForbidden() }

  const { userId, action, data } = await req.json()
  if (!userId || !action) return apiError('参数不完整')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return apiError('用户不存在')

  switch (action) {
    case 'ban':
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          status: 'BANNED',
          banReason: data?.reason,
          banExpiresAt: data?.expiresAt ? new Date(data.expiresAt) : null,
        },
      })
      break
    case 'unban':
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned: false, status: 'ACTIVE', banReason: null, banExpiresAt: null },
      })
      break
    case 'mute':
      await prisma.user.update({
        where: { id: userId },
        data: { isMuted: true, muteExpiresAt: data?.expiresAt ? new Date(data.expiresAt) : null },
      })
      break
    case 'unmute':
      await prisma.user.update({
        where: { id: userId },
        data: { isMuted: false, muteExpiresAt: null },
      })
      break
    case 'setRole':
      await prisma.user.update({
        where: { id: userId },
        data: { role: data.role },
      })
      break
    case 'setTitle':
      await prisma.user.update({
        where: { id: userId },
        data: { title: data.title },
      })
      break
    case 'setPoints':
      await prisma.user.update({
        where: { id: userId },
        data: { points: data.points },
      })
      break
    case 'delete':
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'DELETED' },
      })
      break
    default:
      return apiError('未知操作')
  }

  return apiSuccess(null, '操作成功')
}
