import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, apiSuccess, apiError } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password, adminMode } = await req.json()

    if (!username || !password) {
      return apiError('请输入用户名和密码')
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    })

    if (!user) {
      return apiError('用户不存在')
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      // 记录登录失败日志
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || '',
          isSuccess: false,
          failReason: '密码错误',
        },
      })
      return apiError('密码错误')
    }

    if (user.status === 'BANNED') {
      return apiError('账号已被封禁')
    }

    if (adminMode && user.role === 'USER') {
      return apiError('权限不足，无法登录管理后台')
    }

    if (adminMode && user.role === 'CUSTOMER_SERVICE') {
      // 客服只能访问客服工作台
    }

    // 更新登录信息
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      },
    })

    // 记录登录日志
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || '',
        isSuccess: true,
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
        title: user.title,
        points: user.points,
        level: user.level,
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
    console.error('Login error:', error)
    return apiError('登录失败，请稍后重试', 500)
  }
}
