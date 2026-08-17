import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, apiSuccess, apiError } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, inviteCode } = await req.json()

    if (!username || !email || !password) {
      return apiError('请填写完整注册信息')
    }

    if (username.length < 2 || username.length > 20) {
      return apiError('用户名长度为2-20个字符')
    }

    if (password.length < 6) {
      return apiError('密码长度至少6位')
    }

    // 检查用户名是否已存在
    const exists = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    })
    if (exists) {
      return apiError(exists.username === username ? '用户名已存在' : '邮箱已被注册')
    }

    // 检查是否需要邀请码
    const inviteOnly = await prisma.setting.findUnique({ where: { key: 'invite_only' } })
    if (inviteOnly?.value === 'true' && !inviteCode) {
      return apiError('本站为邀请制，请输入邀请码')
    }

    if (inviteCode) {
      const code = await prisma.inviteCode.findFirst({
        where: { code: inviteCode, isActive: true },
      })
      if (!code) return apiError('邀请码无效')
      if (code.usedCount >= code.maxUses) return apiError('邀请码已用完')
      if (code.expiresAt && new Date(code.expiresAt) < new Date()) return apiError('邀请码已过期')

      await prisma.inviteCode.update({
        where: { id: code.id },
        data: { usedCount: { increment: 1 }, usedById: (await prisma.user.findFirst({ where: { username } }))?.id },
      })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nickname: username,
      },
    })

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    const response = apiSuccess({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return apiError('注册失败，请稍后重试', 500)
  }
}
