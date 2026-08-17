'use client'

import { useState, useEffect } from 'react'

export default function SuperLoginLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userId, setUserId] = useState('')
  const [ipFilter, setIpFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [userDetail, setUserDetail] = useState<any>(null)

  const fetchLogs = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '50' })
    if (userId) params.set('userId', userId)
    if (ipFilter) params.set('ip', ipFilter)
    fetch(`/api/admin/login-logs?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) { setLogs(d.data.items); setTotalPages(d.data.totalPages) }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [page, userId, ipFilter])

  // 查看某个用户的所有登录记录
  const viewUserLogs = (uid: string) => { setUserId(uid); setPage(1) }

  // 获取IP归属地（客户端模拟，实际应接入IP库）
  const getIPLocation = (ip: string) => {
    if (!ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') return '本地'
    // 内网IP
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return '内网'
    return '' // 需要接入IP库
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-map-marked-alt mr-2" style={{ color: '#FFD700' }}></i>登录日志 · IP追踪</h1>

      {/* 筛选 */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input type="text" value={ipFilter} onChange={e => setIpFilter(e.target.value)} className="input pl-10" placeholder="搜索IP地址..." />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}></i>
            </div>
          </div>
          {userId && (
            <button onClick={() => { setUserId(''); setPage(1) }} className="btn btn-secondary">
              <i className="fas fa-times mr-1"></i>清除用户筛选
            </button>
          )}
        </div>
      </div>

      {/* IP统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {(() => {
          const uniqueIPs = new Set(logs.map(l => l.ip).filter(Boolean))
          const successCount = logs.filter(l => l.isSuccess).length
          const failCount = logs.filter(l => !l.isSuccess).length
          const todayLogs = logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length
          return [
            { label: '唯一IP数', value: uniqueIPs.size, color: '#5E50CE', icon: 'fa-globe' },
            { label: '今日登录', value: todayLogs, color: '#22c55e', icon: 'fa-calendar-day' },
            { label: '成功登录', value: successCount, color: '#4a90e2', icon: 'fa-check-circle' },
            { label: '失败尝试', value: failCount, color: '#ef4444', icon: 'fa-times-circle' },
          ].map((s, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <i className={`fas ${s.icon}`} style={{ color: s.color }}></i>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </div>
            </div>
          ))
        })()}
      </div>

      {/* 日志表格 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>用户</th>
                <th>角色</th>
                <th>登录IP</th>
                <th>IP归属地</th>
                <th>设备/浏览器</th>
                <th>状态</th>
                <th>失败原因</th>
                <th>登录时间</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无登录记录</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className={!log.isSuccess ? 'bg-red-500/5' : ''}>
                  <td>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => viewUserLogs(log.userId)}>
                      <img src={log.user?.avatar || '/static/default-avatar.png'} className="w-7 h-7 rounded-full" alt="" />
                      <span className="text-sm hover:text-[var(--primary-light)]">{log.user?.nickname || log.user?.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge role-${(log.user?.role || 'user').toLowerCase()}`}>
                      {log.user?.role === 'SUPERADMIN' ? '超管' : log.user?.role === 'ADMIN' ? '管理' : log.user?.role === 'CUSTOMER_SERVICE' ? '客服' : log.user?.role === 'MODERATOR' ? '版主' : '用户'}
                    </span>
                  </td>
                  <td>
                    <code className="px-2 py-1 rounded text-sm font-mono" style={{ background: 'var(--bg)' }}>
                      {log.ip || '—'}
                    </code>
                  </td>
                  <td>
                    <span className="text-sm">
                      <i className="fas fa-map-marker-alt mr-1" style={{ color: 'var(--error)' }}></i>
                      {getIPLocation(log.ip) || '未知'}
                    </span>
                  </td>
                  <td>
                    <div className="max-w-[200px]">
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }} title={log.userAgent}>
                        {log.userAgent ? (
                          log.userAgent.includes('Windows') ? <><i className="fab fa-windows mr-1"></i>Windows</> :
                          log.userAgent.includes('Mac') ? <><i className="fab fa-apple mr-1"></i>Mac</> :
                          log.userAgent.includes('Linux') ? <><i className="fab fa-linux mr-1"></i>Linux</> :
                          log.userAgent.includes('Android') ? <><i className="fab fa-android mr-1"></i>Android</> :
                          log.userAgent.includes('iPhone') ? <><i className="fab fa-apple mr-1"></i>iOS</> :
                          <><i className="fas fa-globe mr-1"></i>其他</>
                        ) : '—'}
                      </p>
                    </div>
                  </td>
                  <td>
                    {log.isSuccess
                      ? <span className="badge badge-success"><i className="fas fa-check mr-1"></i>成功</span>
                      : <span className="badge badge-error"><i className="fas fa-times mr-1"></i>失败</span>}
                  </td>
                  <td className="text-sm" style={{ color: 'var(--error)' }}>{log.failReason || '—'}</td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="pagination justify-center mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><i className="fas fa-chevron-left"></i></button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''}>{p}</button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><i className="fas fa-chevron-right"></i></button>
        </div>
      )}
    </div>
  )
}
