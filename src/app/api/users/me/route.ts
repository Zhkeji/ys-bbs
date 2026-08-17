import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, verifyPassword, hashPassword, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const body = await req.json()

  if (body.action === 'changePassword') {
    const { current, newPassword } = body
    if (!current || !newPassword) return apiError('请填写完整信息')

    const fullUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!fullUser) return apiError('用户不存在')

    const valid = await verifyPassword(current, fullUser.password)
    if (!valid) return apiError('当前密码错误')

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return apiSuccess(null, '密码已更新')
  }

  const { nickname, bio, avatar, qq, wechat } = body
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(nickname !== undefined && { nickname }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
      ...(qq !== undefined && { qq }),
      ...(wechat !== undefined && { wechat }),
    },
    select: { id: true, username: true, nickname: true, avatar: true, bio: true },
  })

  return apiSuccess(updated, '个人资料已更新')
}
