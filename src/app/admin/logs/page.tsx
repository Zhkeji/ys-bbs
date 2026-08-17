'use client'

import { useState, useEffect } from 'react'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/logs?page=${page}&pageSize=50`).then(r => r.json()).then(d => {
      if (d.code === 0) { setLogs(d.data.items); setTotalPages(d.data.totalPages) }
    }).finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-history mr-2" style={{ color: 'var(--primary)' }}></i>操作日志</h1>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>操作人</th><th>操作</th><th>目标</th><th>详情</th><th>IP</th><th>时间</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无日志</td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td className="text-sm">{log.user?.username || '—'}</td>
                <td><span className="badge badge-primary">{log.action}</span></td>
                <td className="text-sm">{log.target || '—'}</td>
                <td className="text-sm max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>{log.detail || '—'}</td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{log.ip || '—'}</td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString('zh-CN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
