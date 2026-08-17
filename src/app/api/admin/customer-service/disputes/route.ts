import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

// 获取争议列表
export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const priority = searchParams.get('priority')

  const where: any = {}
  if (status) where.status = status
  if (type) where.type = type
  if (priority) where.priority = priority

  const [items, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        order: { select: { id: true, orderNo: true, totalAmount: true, status: true } },
        buyer: { select: { id: true, username: true, nickname: true, avatar: true } },
        seller: { select: { id: true, username: true, nickname: true, avatar: true } },
        handler: { select: { id: true, username: true, nickname: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.dispute.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

// 创建争议 (买家)
export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromReq(req)
  if (!user) return apiError('请先登录')

  const { orderId, type, reason, description, evidence } = await req.json()
  if (!orderId || !type || !reason) return apiError('请填写完整信息')

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return apiError('订单不存在')
  if (order.buyerId !== user.id && order.sellerId !== user.id) return apiError('无权操作此订单')

  // 检查是否已有争议
  const existing = await prisma.dispute.findFirst({ where: { orderId, status: { notIn: ['RESOLVED', 'CLOSED'] } } })
  if (existing) return apiError('该订单已有进行中的争议')

  const disputeNo = `DSP${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const dispute = await prisma.dispute.create({
    data: {
      disputeNo,
      type,
      reason,
      description,
      evidence: evidence || null,
      orderId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    },
  })

  // 更新订单状态
  await prisma.order.update({ where: { id: orderId }, data: { status: 'DISPUTE' } })

  // 记录日志
  await prisma.disputeLog.create({
    data: { action: 'created', detail: `争议已创建: ${reason}`, operatorId: user.id, disputeId: dispute.id },
  })

  // 通知对方
  const notifyUserId = user.id === order.buyerId ? order.sellerId : order.buyerId
  await prisma.notification.create({
    data: {
      type: 'ORDER',
      title: '争议通知',
      content: `订单 ${order.orderNo} 发起了争议: ${reason}`,
      userId: notifyUserId,
      data: { disputeId: dispute.id },
    },
  })

  return apiSuccess(dispute)
}

async function getCurrentUserFromReq(req: NextRequest) {
  const { cookies } = await import('next/headers')
  const { verifyToken } = await import('@/lib/auth')
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  return prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, username: true, role: true } })
}
