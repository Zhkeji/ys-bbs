import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const settings = await prisma.setting.findMany()
  const grouped: Record<string, any[]> = {}
  settings.forEach(s => {
    if (!grouped[s.group]) grouped[s.group] = []
    grouped[s.group].push(s)
  })
  return apiSuccess(grouped)
}

export async function PUT(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const body = await req.json()

  for (const [key, value] of Object.entries(body)) {
    const existing = await prisma.setting.findUnique({ where: { key } })
    const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

    if (existing) {
      await prisma.setting.update({ where: { key }, data: { value: strValue } })
    } else {
      await prisma.setting.create({
        data: { key, value: strValue, group: 'site', label: key },
      })
    }
  }

  return apiSuccess(null, '站点设置已更新')
}
