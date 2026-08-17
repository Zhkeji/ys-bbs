import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiUnauthorized } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const existing = await prisma.favorite.findFirst({ where: { userId: user.id, postId: params.id } })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    await prisma.post.update({ where: { id: params.id }, data: { favoriteCount: { decrement: 1 } } })
    return apiSuccess({ favorited: false })
  } else {
    await prisma.favorite.create({ data: { userId: user.id, postId: params.id } })
    await prisma.post.update({ where: { id: params.id }, data: { favoriteCount: { increment: 1 } } })
    return apiSuccess({ favorited: true })
  }
}
