import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiForbidden } from '@/lib/auth'

export async function GET() {
  try { await requireAdmin() } catch { return apiForbidden() }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsers, totalPosts, totalComments, totalProducts, totalOrders,
    todayUsers, todayPosts, pendingReports, adminCount, inviteCodes,
  ] = await Promise.all([
    prisma.user.count({ where: { status: { not: 'DELETED' } } }),
    prisma.post.count({ where: { isDeleted: false } }),
    prisma.comment.count(),
    prisma.product.count({ where: { status: { not: 'DELETED' } } }),
    prisma.order.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.post.count({ where: { createdAt: { gte: today }, isDeleted: false } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'MODERATOR'] } } }),
    prisma.inviteCode.count({ where: { isActive: true } }),
  ])

  return apiSuccess({
    totalUsers, totalPosts, totalComments, totalProducts, totalOrders,
    todayUsers, todayPosts, pendingReports, adminCount, inviteCodes,
  })
}
