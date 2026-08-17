import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const existing = await prisma.like.findFirst({ where: { userId: user.id, postId: params.id } })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    await prisma.post.update({ where: { id: params.id }, data: { likeCount: { decrement: 1 } } })
    return apiSuccess({ liked: false })
  } else {
    await prisma.like.create({ data: { userId: user.id, postId: params.id } })
    await prisma.post.update({ where: { id: params.id }, data: { likeCount: { increment: 1 } } })

    // 通知作者
    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (post && post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: 'POST_LIKE',
          title: '收到新点赞',
          content: `${user.nickname || user.username} 赞了你的帖子《${post.title}》`,
          userId: post.authorId,
          data: { postId: params.id },
        },
      })
    }

    return apiSuccess({ liked: true })
  }
}
