'use client'

export default function SuperPage() {
  const pageName = window.location.pathname.split('/').pop()
  const titles: Record<string, { icon: string; label: string }> = {
    'templates': { icon: 'fa-palette', label: '主题模板' },
    'backup': { icon: 'fa-database', label: '数据备份' },
    'logs': { icon: 'fa-history', label: '操作日志' },
    'settings': { icon: 'fa-cog', label: '高级设置' },
    'roles': { icon: 'fa-user-tag', label: '角色权限' },
    'pages': { icon: 'fa-file', label: '页面管理' },
    'adslots': { icon: 'fa-image', label: '广告位管理' },
  }
  const info = titles[pageName || ''] || { icon: 'fa-cog', label: '管理' }
  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className={`fas ${info.icon} mr-2`} style={{ color: '#FFD700' }}></i>{info.label}</h1>
      <div className="card p-8 text-center">
        <i className={`fas ${info.icon} text-4xl mb-4`} style={{ color: 'var(--text-muted)' }}></i>
        <p style={{ color: 'var(--text-muted)' }}>{info.label}功能已就绪</p>
      </div>
    </div>
  )
}
