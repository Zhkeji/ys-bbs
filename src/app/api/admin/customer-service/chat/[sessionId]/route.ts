import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, getCurrentUser, apiSuccess, apiError, apiForbidden, apiUnauthorized } from '@/lib/auth'

// 获取会话详情和消息
export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const session = await prisma.customerServiceSession.findFirst({
    where: { OR: [{ sessionId: params.sessionId }, { id: params.sessionId }] },
    include: {
      user: { select: { id: true, username: true, nickname: true, avatar: true } },
      agent: { select: { id: true, username: true, nickname: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, username: true, nickname: true, avatar: true, role: true } } },
      },
    },
  })

  if (!session) return apiError('会话不存在', 404)
  return apiSuccess(session)
}

// 发送消息 / 接单 / 关闭会话
export async function PATCH(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { action, content, type } = await req.json()

  const session = await prisma.customerServiceSession.findFirst({
    where: { OR: [{ sessionId: params.sessionId }, { id: params.sessionId }] },
  })
  if (!session) return apiError('会话不存在')

  switch (action) {
    case 'send': {
      if (!content) return apiError('消息不能为空')
      const msg = await prisma.customerServiceMessage.create({
        data: {
          content,
          type: type || 'text',
          senderId: user.id,
          sessionId: session.id,
        },
        include: { sender: { select: { id: true, username: true, nickname: true, avatar: true } } },
      })
      return apiSuccess(msg)
    }

    case 'accept': {
      // 客服接单
      if (user.role === 'USER') return apiError('权限不足')
      await prisma.customerServiceSession.update({
        where: { id: session.id },
        data: { status: 'ACTIVE', agentId: user.id },
      })
      await prisma.customerServiceMessage.create({
        data: { content: `客服 ${user.nickname || user.username} 已接入，正在为您服务`, type: 'system', sessionId: session.id },
      })
      // 更新客服状态
      await prisma.agentStatus.upsert({
        where: { userId: user.id },
        update: { currentSessions: { increment: 1 }, isOnline: true, lastActiveAt: new Date() },
        create: { userId: user.id, isOnline: true, currentSessions: 1, lastActiveAt: new Date() },
      })
      return apiSuccess(null, '已接单')
    }

    case 'transfer': {
      // 转接
      const { targetAgentId } = await req.json()
      if (!targetAgentId) return apiError('请选择转接目标')
      await prisma.customerServiceSession.update({
        where: { id: session.id },
        data: { agentId: targetAgentId },
      })
      const targetAgent = await prisma.user.findUnique({ where: { id: targetAgentId } })
      await prisma.customerServiceMessage.create({
        data: { content: `会话已转接给 ${targetAgent?.nickname || targetAgent?.username}`, type: 'transfer', sessionId: session.id },
      })
      return apiSuccess(null, '已转接')
    }

    case 'close': {
      await prisma.customerServiceSession.update({
        where: { id: session.id },
        data: { status: 'CLOSED', closedAt: new Date() },
      })
      await prisma.customerServiceMessage.create({
        data: { content: '会话已结束，感谢您的咨询。请对本次服务进行评价。', type: 'system', sessionId: session.id },
      })
      // 更新客服状态
      if (session.agentId) {
        await prisma.agentStatus.update({
          where: { userId: session.agentId },
          data: { currentSessions: { decrement: 1 }, totalHandled: { increment: 1 } },
        }).catch(() => {})
      }
      return apiSuccess(null, '会话已关闭')
    }

    case 'rate': {
      // 用户评价
      const { rating } = await req.json()
      if (!rating || rating < 1 || rating > 5) return apiError('评分1-5')
      await prisma.customerServiceSession.update({
        where: { id: session.id },
        data: { rating, ratedAt: new Date(), status: 'RATED' },
      })
      // 更新客服平均评分
      if (session.agentId) {
        const avg = await prisma.customerServiceSession.aggregate({
          where: { agentId: session.agentId, rating: { not: null } },
          _avg: { rating: true },
        })
        await prisma.agentStatus.update({
          where: { userId: session.agentId },
          data: { avgRating: avg._avg.rating || 0 },
        }).catch(() => {})
      }
      return apiSuccess(null, '评价成功')
    }

    default:
      return apiError('未知操作')
  }
}
