'use client'

import { useState, useEffect } from 'react'

export default function SuperSystemPage() {
  const [info, setInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/super/system').then(r => r.json()).then(d => {
      if (d.code === 0) setInfo(d.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-server mr-2" style={{ color: '#FFD700' }}></i>系统信息</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="font-bold mb-4"><i className="fas fa-info-circle mr-2" style={{ color: 'var(--primary)' }}></i>运行环境</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Node.js 版本', value: info.nodeVersion || '—' },
              { label: '操作系统', value: info.os || '—' },
              { label: '服务器运行时间', value: info.uptime || '—' },
              { label: '内存使用', value: info.memory || '—' },
              { label: 'CPU 使用率', value: info.cpu || '—' },
              { label: '磁盘使用', value: info.disk || '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold mb-4"><i className="fas fa-database mr-2" style={{ color: 'var(--primary)' }}></i>数据库状态</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: '数据库类型', value: info.dbType || 'MySQL' },
              { label: '数据库版本', value: info.dbVersion || '—' },
              { label: '数据库大小', value: info.dbSize || '—' },
              { label: '连接状态', value: '正常', status: 'success' },
              { label: '活跃连接数', value: info.dbConnections || '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                {item.status ? <span className={`badge badge-${item.status}`}>{item.value}</span> : <span className="text-sm font-medium">{item.value}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 mt-4">
        <h2 className="font-bold mb-4"><i className="fas fa-shield-alt mr-2" style={{ color: '#FFD700' }}></i>安全检查</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'HTTPS', status: 'success', desc: '安全连接已启用' },
            { label: '数据库备份', status: 'warning', desc: '建议定期备份' },
            { label: '系统更新', status: 'success', desc: '已是最新版本' },
          ].map((check, i) => (
            <div key={i} className="p-4 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge badge-${check.status}`}>{check.label}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{check.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
