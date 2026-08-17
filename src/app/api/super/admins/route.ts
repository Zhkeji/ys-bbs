import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin, hashPassword, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, username: true, email: true, nickname: true, avatar: true,
      role: true, title: true, lastLoginAt: true, lastLoginIp: true,
      createdAt: true,
    },
  })
  return apiSuccess(admins)
}

export async function POST(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const { username, email, password, role, nickname } = await req.json()

  if (!username || !email || !password) return apiError('请填写完整信息')
  if (!['ADMIN', 'MODERATOR'].includes(role)) return apiError('无效的角色')

  const exists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })
  if (exists) return apiError('用户名或邮箱已存在')

  const hashedPassword = await hashPassword(password)
  const admin = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role,
      nickname: nickname || username,
    },
  })

  return apiSuccess({ id: admin.id, username: admin.username, role: admin.role })
}

export async function PATCH(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const { userId, action, data } = await req.json()

  switch (action) {
    case 'setRole':
      if (!['ADMIN', 'MODERATOR', 'USER'].includes(data.role)) return apiError('无效的角色')
      await prisma.user.update({ where: { id: userId }, data: { role: data.role } })
      break
    case 'resetPassword':
      const hashed = await hashPassword(data.password || '123456')
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
      break
    case 'setTitle':
      await prisma.user.update({ where: { id: userId }, data: { title: data.title } })
      break
    case 'delete':
      await prisma.user.update({ where: { id: userId }, data: { status: 'DELETED' } })
      break
  }

  return apiSuccess(null, '操作成功')
}
