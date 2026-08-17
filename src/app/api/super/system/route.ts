import { requireSuperAdmin, apiSuccess, apiForbidden } from '@/lib/auth'
import os from 'os'

export async function GET() {
  try { await requireSuperAdmin() } catch { return apiForbidden() }

  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  return apiSuccess({
    nodeVersion: process.version,
    os: `${os.type()} ${os.release()} (${os.arch()})`,
    uptime: formatUptime(os.uptime()),
    memory: `${(usedMem / 1024 / 1024 / 1024).toFixed(1)}GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(1)}GB`,
    cpu: os.cpus()[0]?.model || '—',
    disk: '—',
    dbType: 'PostgreSQL',
    dbVersion: '—',
    dbSize: '—',
    dbConnections: '—',
  })
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}天 ${hours}小时 ${mins}分钟`
  if (hours > 0) return `${hours}小时 ${mins}分钟`
  return `${mins}分钟`
}
