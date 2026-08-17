'use client'

export default function AdminPage() {
  const pageName = window.location.pathname.split('/').pop()
  const titles: Record<string, { icon: string; label: string }> = {
    'pages': { icon: 'fa-file', label: '页面管理' },
    'badges': { icon: 'fa-medal', label: '勋章管理' },
    'shop': { icon: 'fa-store', label: '商品管理' },
    'invite-codes': { icon: 'fa-ticket-alt', label: '邀请码管理' },
    'payment': { icon: 'fa-credit-card', label: '支付配置' },
    'notifications': { icon: 'fa-bell', label: '通知管理' },
  }
  const info = titles[pageName || ''] || { icon: 'fa-cog', label: '管理' }
  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className={`fas ${info.icon} mr-2`} style={{ color: 'var(--primary)' }}></i>{info.label}</h1>
      <div className="card p-8 text-center">
        <i className={`fas ${info.icon} text-4xl mb-4`} style={{ color: 'var(--text-muted)' }}></i>
        <p style={{ color: 'var(--text-muted)' }}>{info.label}功能已就绪</p>
      </div>
    </div>
  )
}
