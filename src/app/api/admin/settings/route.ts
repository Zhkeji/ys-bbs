import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, apiSuccess, apiError, apiForbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const settings = await prisma.setting.findMany()
  const map: Record<string, any> = {}
  settings.forEach(s => {
    let val: any = s.value
    if (s.type === 'boolean') val = val === 'true'
    else if (s.type === 'number') val = Number(val)
    else if (s.type === 'json') try { val = JSON.parse(val) } catch {}
    map[s.key] = val
  })
  return apiSuccess(map)
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin() } catch { return apiForbidden() }

  const body = await req.json()
  for (const [key, value] of Object.entries(body)) {
    const existing = await prisma.setting.findUnique({ where: { key } })
    const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

    if (existing) {
      await prisma.setting.update({ where: { key }, data: { value: strValue } })
    } else {
      await prisma.setting.create({ data: { key, value: strValue, group: 'general' } })
    }
  }
  return apiSuccess(null, '设置已保存')
}
