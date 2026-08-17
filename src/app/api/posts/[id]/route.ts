import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id, isDeleted: false },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true, bio: true, role: true, title: true, badge: true, level: true, postCount: true, points: true } },
      category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      comments: {
        where: { isDeleted: false, parentId: null },
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, nickname: true, avatar: true, role: true, title: true, level: true } },
          replies: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: { id: true, username: true, nickname: true, avatar: true, role: true, title: true, level: true } },
            },
          },
          _count: { select: { likes: true } },
        },
      },
      _count: { select: { comments: true, likes: true, favorites: true } },
    },
  })

  if (!post) return apiError('帖子不存在', 404)

  // 增加浏览量
  await prisma.post.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  })

  // 检查当前用户是否已点赞/收藏
  const user = await getCurrentUser()
  let isLiked = false
  let isFavorited = false
  if (user) {
    const [like, fav] = await Promise.all([
      prisma.like.findFirst({ where: { userId: user.id, postId: params.id } }),
      prisma.favorite.findFirst({ where: { userId: user.id, postId: params.id } }),
    ])
    isLiked = !!like
    isFavorited = !!fav
  }

  return apiSuccess({ ...post, isLiked, isFavorited })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return apiError('请先登录')

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return apiError('帖子不存在')
  if (post.authorId !== user.id && user.role === 'USER') return apiError('无权编辑此帖子')

  const body = await req.json()
  const updated = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title,
      content: body.content,
      categoryId: body.categoryId,
      tags: body.tags,
      coverImage: body.coverImage,
      excerpt: body.excerpt,
    },
  })

  return apiSuccess(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return apiError('请先登录')

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return apiError('帖子不存在')
  if (post.authorId !== user.id && user.role === 'USER') return apiError('无权删除此帖子')

  // 软删除
  await prisma.post.update({
    where: { id: params.id },
    data: { isDeleted: true, deletedAt: new Date() },
  })

  return apiSuccess(null, '删除成功')
}
