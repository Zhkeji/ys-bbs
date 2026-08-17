import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

// 获取争议详情
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: {
      order: true,
      buyer: { select: { id: true, username: true, nickname: true, avatar: true, level: true } },
      seller: { select: { id: true, username: true, nickname: true, avatar: true, level: true } },
      handler: { select: { id: true, username: true, nickname: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, username: true, nickname: true, avatar: true, role: true } } },
      },
      logs: {
        orderBy: { createdAt: 'asc' },
        include: { operator: { select: { id: true, username: true, nickname: true } } },
      },
    },
  })

  if (!dispute) return apiError('争议不存在', 404)
  return apiSuccess(dispute)
}

// 客服处理争议
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return apiForbidden()

  const { action, data } = await req.json()
  const dispute = await prisma.dispute.findUnique({ where: { id: params.id } })
  if (!dispute) return apiError('争议不存在')

  switch (action) {
    case 'accept': {
      // 客服接单
      await prisma.dispute.update({
        where: { id: params.id },
        data: { status: 'CS_INTERVENTION', handlerId: admin.id },
      })
      await prisma.disputeLog.create({
        data: { action: 'accepted', detail: '客服已介入处理', operatorId: admin.id, disputeId: params.id },
      })
      // 发送系统消息
      await prisma.disputeMessage.create({
        data: { content: `客服 ${admin.nickname || admin.username} 已介入处理此争议`, type: 'SYSTEM', senderId: admin.id, disputeId: params.id },
      })
      break
    }

    case 'request_evidence': {
      // 要求举证
      await prisma.dispute.update({
        where: { id: params.id },
        data: { status: 'PENDING_EVIDENCE' },
      })
      await prisma.disputeMessage.create({
        data: { content: data?.message || '请双方提供相关证据（截图、聊天记录等）', type: 'CS_REPLY', senderId: admin.id, disputeId: params.id },
      })
      await prisma.disputeLog.create({
        data: { action: 'request_evidence', detail: data?.message, operatorId: admin.id, disputeId: params.id },
      })
      break
    }

    case 'reply': {
      // 客服回复
      if (!data?.content) return apiError('回复内容不能为空')
      await prisma.disputeMessage.create({
        data: { content: data.content, type: 'CS_REPLY', images: data.images || null, senderId: admin.id, disputeId: params.id },
      })
      break
    }

    case 'resolve': {
      // 解决争议
      const resultAmount = data?.resultAmount || 0
      await prisma.dispute.update({
        where: { id: params.id },
        data: {
          status: 'RESOLVED',
          result: data?.result,
          resultAmount,
          resolvedAt: new Date(),
          handlerId: admin.id,
        },
      })

      // 执行退款
      if (resultAmount > 0) {
        await prisma.order.update({
          where: { id: dispute.orderId },
          data: { refundStatus: 'APPROVED', refundAmount: resultAmount, refundReason: data?.result },
        })
      }

      // 发送结果消息
      await prisma.disputeMessage.create({
        data: {
          content: `争议已处理完成。${data?.result || ''}${resultAmount > 0 ? `\n退款金额: ¥${resultAmount}` : ''}`,
          type: 'RESULT',
          senderId: admin.id,
          disputeId: params.id,
        },
      })

      await prisma.disputeLog.create({
        data: { action: 'resolved', detail: `处理结果: ${data?.result}, 退款: ¥${resultAmount}`, operatorId: admin.id, disputeId: params.id },
      })

      // 通知双方
      for (const uid of [dispute.buyerId, dispute.sellerId]) {
        await prisma.notification.create({
          data: {
            type: 'REPORT_RESULT',
            title: '争议处理结果',
            content: `争议 ${dispute.disputeNo} 已处理: ${data?.result || '已完成'}${resultAmount > 0 ? `, 退款 ¥${resultAmount}` : ''}`,
            userId: uid,
            data: { disputeId: dispute.id },
          },
        })
      }
      break
    }

    case 'close': {
      await prisma.dispute.update({
        where: { id: params.id },
        data: { status: 'CLOSED', resolvedAt: new Date() },
      })
      await prisma.disputeLog.create({
        data: { action: 'closed', detail: data?.reason || '争议已关闭', operatorId: admin.id, disputeId: params.id },
      })
      break
    }

    case 'escalate': {
      // 升级争议
      await prisma.dispute.update({
        where: { id: params.id },
        data: { status: 'ESCALATED', priority: 'URGENT' },
      })
      await prisma.disputeLog.create({
        data: { action: 'escalated', detail: data?.reason || '争议已升级', operatorId: admin.id, disputeId: params.id },
      })
      break
    }

    case 'set_priority': {
      await prisma.dispute.update({
        where: { id: params.id },
        data: { priority: data?.priority || 'HIGH' },
      })
      break
    }

    default:
      return apiError('未知操作')
  }

  return apiSuccess(null, '操作成功')
}
