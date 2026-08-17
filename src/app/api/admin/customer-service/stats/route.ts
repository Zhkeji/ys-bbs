import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiForbidden } from '@/lib/auth'

export async function GET() {
  try { await requireAdmin() } catch { return apiForbidden() }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalDisputes, openDisputes, resolvedDisputes, todayDisputes,
    totalSessions, activeSessions, waitingSessions, todaySessions,
    avgRating,
  ] = await Promise.all([
    prisma.dispute.count(),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'NEGOTIATING', 'CS_INTERVENTION', 'PENDING_EVIDENCE', 'PENDING_REVIEW'] } } }),
    prisma.dispute.count({ where: { status: 'RESOLVED' } }),
    prisma.dispute.count({ where: { createdAt: { gte: today } } }),
    prisma.customerServiceSession.count(),
    prisma.customerServiceSession.count({ where: { status: 'ACTIVE' } }),
    prisma.customerServiceSession.count({ where: { status: 'WAITING' } }),
    prisma.customerServiceSession.count({ where: { createdAt: { gte: today } } }),
    prisma.customerServiceSession.aggregate({ where: { rating: { not: null } }, _avg: { rating: true } }),
  ])

  // 客服排行
  const agents = await prisma.agentStatus.findMany({
    include: { user: { select: { id: true, username: true, nickname: true, avatar: true } } },
    orderBy: { totalHandled: 'desc' },
    take: 10,
  })

  return apiSuccess({
    disputes: { total: totalDisputes, open: openDisputes, resolved: resolvedDisputes, today: todayDisputes },
    sessions: { total: totalSessions, active: activeSessions, waiting: waitingSessions, today: todaySessions },
    avgRating: avgRating._avg.rating?.toFixed(1) || '0',
    agents,
  })
}
