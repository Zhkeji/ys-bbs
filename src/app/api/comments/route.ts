import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  if (user.isMuted && user.muteExpiresAt && new Date(user.muteExpiresAt) > new Date()) {
    return apiError('您已被禁言，暂时无法评论')
  }

  const { content, postId, parentId } = await req.json()
  if (!content || !postId) return apiError('评论内容不能为空')

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || post.isDeleted) return apiError('帖子不存在')

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: user.id,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true, role: true, title: true, level: true } },
    },
  })

  // 更新帖子评论数
  await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
  })

  // 更新用户经验
  await prisma.user.update({
    where: { id: user.id },
    data: { commentCount: { increment: 1 }, exp: { increment: 5 } },
  })

  // 发送通知
  if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        type: 'POST_COMMENT',
        title: '新评论通知',
        content: `${user.nickname || user.username} 评论了你的帖子《${post.title}》`,
        userId: post.authorId,
        data: { postId, commentId: comment.id },
      },
    })
  }

  return apiSuccess(comment)
}
