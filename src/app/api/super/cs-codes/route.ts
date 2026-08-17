import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'
import { v4 as uuid } from 'uuid'

export async function GET() {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const codes = await prisma.inviteCode.findMany({
    where: { code: { startsWith: 'CS-' } },
    orderBy: { createdAt: 'desc' },
  })
  return apiSuccess(codes)
}

export async function POST(req: NextRequest) {
  try { const admin = await requireSuperAdmin() } catch { return apiForbidden() }
  const admin2 = await requireSuperAdmin()

  const { maxUses, expiresInDays } = await req.json()

  const code = `CS-${uuid().slice(0, 8).toUpperCase()}`
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null

  const inviteCode = await prisma.inviteCode.create({
    data: {
      code,
      maxUses: maxUses || 10,
      expiresAt,
      creatorId: admin2.id,
    },
  })

  return apiSuccess(inviteCode)
}

export async function PATCH(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const { id, isActive } = await req.json()
  await prisma.inviteCode.update({ where: { id }, data: { isActive } })
  return apiSuccess(null, '已更新')
}

export async function DELETE(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return apiError('缺少ID')

  await prisma.inviteCode.delete({ where: { id } })
  return apiSuccess(null, '已删除')
}
