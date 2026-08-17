import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: params.username }, { id: params.username }],
      status: { not: 'DELETED' },
    },
    select: {
      id: true, username: true, nickname: true, avatar: true, bio: true,
      role: true, title: true, badge: true, points: true, exp: true, level: true,
      postCount: true, commentCount: true, likeCount: true, createdAt: true,
      userBadges: {
        include: { badge: true },
      },
    },
  })

  if (!user) return apiError('用户不存在', 404)
  return apiSuccess(user)
}
