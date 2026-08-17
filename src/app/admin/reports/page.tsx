'use client'

import { useState, useEffect } from 'react'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchReports = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (status) params.set('status', status)
    fetch(`/api/reports?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) { setReports(d.data.items); setTotalPages(d.data.totalPages) }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchReports() }, [page, status])

  const handleAction = async (reportId: string, action: string) => {
    const handleNote = action === 'RESOLVED' ? '' : prompt('处理备注:')
    const res = await fetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status: action, handleNote }),
    })
    const d = await res.json()
    if (d.code === 0) fetchReports()
    else alert(d.message)
  }

  const statusColors: Record<string, string> = {
    PENDING: 'badge-warning',
    PROCESSING: 'badge-primary',
    RESOLVED: 'badge-success',
    REJECTED: 'badge-error',
  }
  const statusLabels: Record<string, string> = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    RESOLVED: '已采纳',
    REJECTED: '已驳回',
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-flag mr-2" style={{ color: 'var(--primary)' }}></i>举报中心</h1>

      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          {['', 'PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s ? statusLabels[s] : '全部'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>类型</th>
              <th>举报原因</th>
              <th>举报人</th>
              <th>处理人</th>
              <th>状态</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无举报</td></tr>
            ) : reports.map(report => (
              <tr key={report.id}>
                <td>
                  <span className="badge badge-primary">
                    {report.type === 'POST' ? '帖子' : report.type === 'COMMENT' ? '评论' : '用户'}
                  </span>
                </td>
                <td>
                  <p className="font-medium">{report.reason}</p>
                  {report.description && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{report.description}</p>}
                </td>
                <td className="text-sm">{report.reporter?.username}</td>
                <td className="text-sm">{report.handler?.username || '—'}</td>
                <td><span className={`badge ${statusColors[report.status]}`}>{statusLabels[report.status]}</span></td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(report.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>
                  {report.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleAction(report.id, 'RESOLVED')} className="btn btn-secondary btn-sm" title="采纳"><i className="fas fa-check text-green-500"></i></button>
                      <button onClick={() => handleAction(report.id, 'REJECTED')} className="btn btn-secondary btn-sm" title="驳回"><i className="fas fa-times text-red-500"></i></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
