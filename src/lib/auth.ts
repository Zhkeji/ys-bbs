import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'ys-forum-secret'

export interface JwtPayload {
  userId: string
  username: string
  role: Role
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      nickname: true,
      avatar: true,
      bio: true,
      role: true,
      title: true,
      badge: true,
      points: true,
      exp: true,
      level: true,
      postCount: true,
      commentCount: true,
      isBanned: true,
      banExpiresAt: true,
      isMuted: true,
      muteExpiresAt: true,
      status: true,
      createdAt: true,
    },
  })

  if (!user || user.status === 'BANNED' || user.status === 'DELETED') return null
  return user
}

export function isAdmin(role: Role): boolean {
  return role === 'ADMIN' || role === 'SUPERADMIN'
}

export function isSuperAdmin(role: Role): boolean {
  return role === 'SUPERADMIN'
}

export function isModerator(role: Role): boolean {
  return role === 'MODERATOR' || role === 'ADMIN' || role === 'SUPERADMIN'
}

export function isCustomerService(role: Role): boolean {
  return role === 'CUSTOMER_SERVICE'
}

export function canAccessAdmin(role: Role): boolean {
  return ['MODERATOR', 'ADMIN', 'SUPERADMIN', 'CUSTOMER_SERVICE'].includes(role)
}

// API 响应工具
export function apiSuccess(data: any, message = 'success') {
  return Response.json({ code: 0, message, data })
}

export function apiError(message: string, code = 400) {
  return Response.json({ code, message, data: null }, { status: code >= 500 ? 500 : 200 })
}

export function apiUnauthorized() {
  return Response.json({ code: 401, message: '请先登录', data: null }, { status: 401 })
}

export function apiForbidden() {
  return Response.json({ code: 403, message: '权限不足', data: null }, { status: 403 })
}

// 权限检查中间件
export async function requireAuth(): Promise<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>> {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (!isAdmin(user.role)) throw new Error('FORBIDDEN')
  return user
}

export async function requireSuperAdmin() {
  const user = await requireAuth()
  if (!isSuperAdmin(user.role)) throw new Error('FORBIDDEN')
  return user
}
