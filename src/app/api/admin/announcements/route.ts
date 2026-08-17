import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const items = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })
  return apiSuccess(items)
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const body = await req.json()
  const { title, content, type, isActive, startsAt, expiresAt } = body

  if (!title || !content) return apiError('标题和内容不能为空')

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      type: type || 'info',
      isActive: isActive !== false,
      startsAt: startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  return apiSuccess(announcement)
}

export async function DELETE(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return apiError('缺少ID')

  await prisma.announcement.delete({ where: { id } })
  return apiSuccess(null, '删除成功')
}
