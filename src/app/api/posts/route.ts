import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const categoryId = searchParams.get('categoryId')
  const categorySlug = searchParams.get('category')
  const sort = searchParams.get('sort') || 'latest'
  const search = searchParams.get('q')
  const authorId = searchParams.get('authorId')

  const where: any = { isDeleted: false, isDraft: false }
  if (categoryId) where.categoryId = categoryId
  if (authorId) where.authorId = authorId
  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (cat) where.categoryId = cat.id
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'hot') orderBy = { viewCount: 'desc' }
  if (sort === 'comments') orderBy = { commentCount: 'desc' }
  if (sort === 'likes') orderBy = { likeCount: 'desc' }

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { isFeatured: 'desc' }, orderBy],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, username: true, nickname: true, avatar: true, role: true, title: true, badge: true, level: true } },
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return apiSuccess({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  if (user.isMuted && user.muteExpiresAt && new Date(user.muteExpiresAt) > new Date()) {
    return apiError('您已被禁言，暂时无法发帖')
  }

  const body = await req.json()
  const { title, content, categoryId, tags, isDraft, coverImage, excerpt, scheduledAt } = body

  if (!title || !content || !categoryId) {
    return apiError('标题、内容和分类不能为空')
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) return apiError('分类不存在')

  // 检查是否需要审核
  const autoApprove = await prisma.setting.findUnique({ where: { key: 'auto_approve' } })
  const isFirstPost = user.postCount === 0
  const needsApproval = autoApprove?.value === 'false' || isFirstPost

  const post = await prisma.post.create({
    data: {
      title,
      content,
      categoryId,
      authorId: user.id,
      tags: tags || null,
      isDraft: isDraft || false,
      isApproved: !needsApproval,
      coverImage: coverImage || null,
      excerpt: excerpt || content.slice(0, 200),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true, role: true, title: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  })

  // 更新用户发帖数
  if (!isDraft) {
    await prisma.user.update({
      where: { id: user.id },
      data: { postCount: { increment: 1 }, exp: { increment: 10 } },
    })
  }

  return apiSuccess(post)
}
