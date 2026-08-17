import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('q')
  const status = searchParams.get('status') // pending, approved, deleted

  const where: any = {}
  if (search) where.OR = [{ title: { contains: search } }]
  if (status === 'pending') where.isApproved = false
  if (status === 'approved') where.isApproved = true
  if (status === 'deleted') where.isDeleted = true

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, username: true, nickname: true, avatar: true, role: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { postId, action, data } = await req.json()
  if (!postId || !action) return apiError('参数不完整')

  switch (action) {
    case 'approve':
      await prisma.post.update({ where: { id: postId }, data: { isApproved: true } })
      break
    case 'reject':
      await prisma.post.update({ where: { id: postId }, data: { isApproved: false } })
      break
    case 'pin':
      await prisma.post.update({ where: { id: postId }, data: { isPinned: data?.pinned ?? true } })
      break
    case 'feature':
      await prisma.post.update({ where: { id: postId }, data: { isFeatured: data?.featured ?? true } })
      break
    case 'close':
      await prisma.post.update({ where: { id: postId }, data: { isClosed: data?.closed ?? true } })
      break
    case 'move':
      await prisma.post.update({ where: { id: postId }, data: { categoryId: data.categoryId } })
      break
    case 'delete':
      await prisma.post.update({ where: { id: postId }, data: { isDeleted: true, deletedAt: new Date() } })
      break
    case 'restore':
      await prisma.post.update({ where: { id: postId }, data: { isDeleted: false, deletedAt: null } })
      break
    default:
      return apiError('未知操作')
  }

  return apiSuccess(null, '操作成功')
}
