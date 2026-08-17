import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 365) return `${d.getMonth() + 1}月${d.getDate()}日`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

export function generateOrderNo(): string {
  const now = new Date()
  const date = now.toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14)
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `YS${date}${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function getImageUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `/uploads/${path}`
}

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'YS系统圈论坛'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// 角色中文名
export const roleNames: Record<string, string> = {
  USER: '普通用户',
  MODERATOR: '版主',
  ADMIN: '管理员',
  SUPERADMIN: '超级管理员',
  CUSTOMER_SERVICE: '客服',
}

// 订单状态中文
export const orderStatusNames: Record<string, string> = {
  PENDING: '待付款',
  PAID: '已付款',
  DELIVERED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  DISPUTE: '争议中',
  REFUNDED: '已退款',
}

// 退款状态中文
export const refundStatusNames: Record<string, string> = {
  NONE: '无',
  REQUESTED: '申请中',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  COMPLETED: '已完成',
}
