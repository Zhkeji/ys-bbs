import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, getCurrentUser, apiSuccess, apiError, apiForbidden, apiUnauthorized } from '@/lib/auth'
import { v4 as uuid } from 'uuid'

// 获取客服会话列表
export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where: any = {}
  if (status) where.status = status

  const sessions = await prisma.customerServiceSession.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true, nickname: true, avatar: true } },
      agent: { select: { id: true, username: true, nickname: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { messages: true } },
    },
  })

  return apiSuccess(sessions)
}

// 用户发起客服会话
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { subject } = await req.json()

  // 检查是否有进行中的会话
  const existing = await prisma.customerServiceSession.findFirst({
    where: { userId: user.id, status: { in: ['WAITING', 'ACTIVE'] } },
  })
  if (existing) return apiSuccess(existing)

  const session = await prisma.customerServiceSession.create({
    data: {
      sessionId: uuid(),
      userId: user.id,
      subject: subject || '在线咨询',
    },
  })

  // 发送欢迎消息
  await prisma.customerServiceMessage.create({
    data: {
      content: '您好，欢迎联系YS平台客服，请问有什么可以帮助您的？',
      type: 'system',
      sessionId: session.id,
    },
  })

  return apiSuccess(session)
}
