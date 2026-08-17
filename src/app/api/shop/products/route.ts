import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const category = searchParams.get('category')
  const gameName = searchParams.get('game')
  const sort = searchParams.get('sort') || 'latest'
  const search = searchParams.get('q')

  const where: any = { status: 'ACTIVE' }
  if (category) where.category = category
  if (gameName) where.gameName = gameName
  if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }]

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'sales') orderBy = { sales: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        seller: { select: { id: true, username: true, nickname: true, avatar: true, level: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const body = await req.json()
  const { title, description, price, originalPrice, images, category, gameName, gameServer, stock } = body

  if (!title || !description || !price) return apiError('请填写完整商品信息')

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      images: images || null,
      category,
      gameName,
      gameServer,
      stock: parseInt(stock) || 1,
      sellerId: user.id,
    },
  })

  return apiSuccess(product)
}
