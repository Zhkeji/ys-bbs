import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const categories = await prisma.category.findMany({
    where: { isHidden: false },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { posts: true } },
      children: {
        where: { isHidden: false },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { posts: true } } },
      },
    },
  })

  return apiSuccess(categories)
}

export async function POST(req: NextRequest) {
  // Admin only - checked in admin routes
  const body = await req.json()
  const { name, slug, description, icon, color, sortOrder, parentId } = body

  if (!name || !slug) return apiError('分类名称和URL不能为空')

  const exists = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  })
  if (exists) return apiError('分类名称或URL已存在')

  const category = await prisma.category.create({
    data: { name, slug, description, icon, color, sortOrder: sortOrder || 0, parentId },
  })

  return apiSuccess(category)
}
