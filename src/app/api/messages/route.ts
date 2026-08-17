import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { searchParams } = new URL(req.url)
  const targetUserId = searchParams.get('userId')

  if (targetUserId) {
    // 获取与某用户的对话
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true, nickname: true, avatar: true } },
        receiver: { select: { id: true, username: true, nickname: true, avatar: true } },
      },
    })

    // 标记已读
    await prisma.message.updateMany({
      where: { senderId: targetUserId, receiverId: user.id, isRead: false },
      data: { isRead: true },
    })

    return apiSuccess(messages)
  }

  // 获取会话列表
  const conversations = await prisma.$queryRaw`
    SELECT
      CASE WHEN senderId = ${user.id} THEN receiverId ELSE senderId END as otherUserId,
      MAX(createdAt) as lastMessageAt,
      COUNT(CASE WHEN isRead = false AND receiverId = ${user.id} THEN 1 END) as unreadCount
    FROM Message
    WHERE senderId = ${user.id} OR receiverId = ${user.id}
    GROUP BY otherUserId
    ORDER BY lastMessageAt DESC
  `

  return apiSuccess(conversations)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { receiverId, content, type } = await req.json()
  if (!receiverId || !content) return apiError('参数不完整')

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
  if (!receiver) return apiError('接收用户不存在')

  const message = await prisma.message.create({
    data: {
      content,
      type: type || 'TEXT',
      senderId: user.id,
      receiverId,
    },
    include: {
      sender: { select: { id: true, username: true, nickname: true, avatar: true } },
    },
  })

  return apiSuccess(message)
}
