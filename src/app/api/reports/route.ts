import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireAdmin, apiSuccess, apiError, apiForbidden, apiUnauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const status = searchParams.get('status')

  const where: any = {}
  if (status) where.status = status

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        reporter: { select: { id: true, username: true, nickname: true } },
        handler: { select: { id: true, username: true, nickname: true } },
      },
    }),
    prisma.report.count({ where }),
  ])

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  const { type, targetId, reason, description } = await req.json()
  if (!type || !targetId || !reason) return apiError('请填写举报信息')

  const report = await prisma.report.create({
    data: {
      type,
      targetId,
      reason,
      description,
      reporterId: user.id,
    },
  })
  return apiSuccess(report, '举报已提交')
}

export async function PATCH(req: NextRequest) {
  try { const admin = await requireAdmin() } catch { return apiForbidden() }

  const { reportId, status, handleNote } = await req.json()
  if (!reportId || !status) return apiError('参数不完整')

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      handleNote,
      handlerId: (await requireAdmin()).id,
    },
  })

  // 通知举报人
  await prisma.notification.create({
    data: {
      type: 'REPORT_RESULT',
      title: '举报处理结果',
      content: `您的举报已处理：${status === 'RESOLVED' ? '已采纳' : '已驳回'}`,
      userId: report.reporterId,
      data: { reportId: report.id },
    },
  })

  return apiSuccess(report, '处理成功')
}
