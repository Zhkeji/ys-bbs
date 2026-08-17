import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, apiSuccess, apiError } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, nickname, inviteCode } = await req.json()

    if (!username || !email || !password || !inviteCode) {
      return apiError('请填写完整信息并输入客服邀请码')
    }

    if (username.length < 2 || username.length > 20) {
      return apiError('用户名长度为2-20个字符')
    }

    if (password.length < 6) {
      return apiError('密码长度至少6位')
    }

    // 验证客服邀请码
    const code = await prisma.inviteCode.findFirst({
      where: {
        code: inviteCode,
        isActive: true,
        // CS invite codes have a special prefix
        code: { startsWith: 'CS-' },
      },
    })

    if (!code) {
      return apiError('无效的客服邀请码')
    }

    if (code.usedCount >= code.maxUses) {
      return apiError('邀请码已用完')
    }

    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return apiError('邀请码已过期')
    }

    // 检查用户名/邮箱是否已存在
    const exists = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    })
    if (exists) {
      return apiError(exists.username === username ? '用户名已存在' : '邮箱已被注册')
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nickname: nickname || username,
        role: 'CUSTOMER_SERVICE',
      },
    })

    // 更新邀请码使用次数
    await prisma.inviteCode.update({
      where: { id: code.id },
      data: { usedCount: { increment: 1 }, usedById: user.id },
    })

    // 创建客服状态记录
    await prisma.agentStatus.create({
      data: { userId: user.id, isOnline: false },
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
    console.error('CS Register error:', error)
    return apiError('注册失败，请稍后重试', 500)
  }
}
