import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'
import { generateOrderNo } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const type = searchParams.get('type') || 'buy' // buy | sell
  const status = searchParams.get('status')

  const where: any = {}
  if (type === 'buy') where.buyerId = user.id
  else where.sellerId = user.id
  if (status) where.status = status

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        product: { select: { id: true, title: true, images: true, price: true } },
        buyer: { select: { id: true, username: true, nickname: true, avatar: true } },
        seller: { select: { id: true, username: true, nickname: true, avatar: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { productId, quantity } = await req.json()
  if (!productId) return apiError('请选择商品')

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true },
  })

  if (!product || product.status !== 'ACTIVE') return apiError('商品不存在或已下架')
  if (product.stock < (quantity || 1)) return apiError('库存不足')
  if (product.sellerId === user.id) return apiError('不能购买自己的商品')

  const qty = quantity || 1
  const totalAmount = product.price * qty

  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      quantity: qty,
      totalAmount,
      buyerId: user.id,
      sellerId: product.sellerId,
      productId: product.id,
    },
  })

  // 更新库存
  await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: qty } },
  })

  // 通知卖家
  await prisma.notification.create({
    data: {
      type: 'ORDER',
      title: '新订单通知',
      content: `您有一笔新订单，订单号：${order.orderNo}`,
      userId: product.sellerId,
      data: { orderId: order.id },
    },
  })

  return apiSuccess(order)
}
