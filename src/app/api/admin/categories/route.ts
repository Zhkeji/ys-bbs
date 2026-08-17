import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { posts: true, moderators: true } },
      children: { orderBy: { sortOrder: 'asc' }, include: { _count: { select: { posts: true } } } },
      moderators: { include: { user: { select: { id: true, username: true, nickname: true } } } },
    },
  })
  return apiSuccess(categories)
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const body = await req.json()
  const { name, slug, description, icon, color, sortOrder, parentId, isHidden } = body

  if (!name || !slug) return apiError('分类名称和URL不能为空')

  const category = await prisma.category.create({
    data: { name, slug, description, icon, color, sortOrder: sortOrder || 0, parentId, isHidden: isHidden || false },
  })
  return apiSuccess(category)
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const body = await req.json()
  const { id, ...data } = body

  const category = await prisma.category.update({
    where: { id },
    data,
  })
  return apiSuccess(category)
}

export async function DELETE(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return apiError('缺少分类ID')

  const postCount = await prisma.post.count({ where: { categoryId: id } })
  if (postCount > 0) return apiError(`该分类下有${postCount}个帖子，请先移动或删除帖子`)

  await prisma.category.delete({ where: { id } })
  return apiSuccess(null, '删除成功')
}
