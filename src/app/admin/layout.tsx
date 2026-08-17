'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.code === 0) {
        const allowedRoles = ['ADMIN', 'SUPERADMIN', 'MODERATOR', 'CUSTOMER_SERVICE']
        if (!allowedRoles.includes(d.data.role)) {
          window.location.href = '/'
          return
        }
        setUser(d.data)
      } else {
        window.location.href = '/cs'
      }
    })
  }, [])

  const allMenuItems = [
    { icon: 'fa-tachometer-alt', label: '仪表盘', href: '/admin', roles: ['ADMIN', 'SUPERADMIN', 'MODERATOR'] },
    { icon: 'fa-users', label: '用户管理', href: '/admin/users', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-file-alt', label: '帖子管理', href: '/admin/posts', roles: ['ADMIN', 'SUPERADMIN', 'MODERATOR'] },
    { icon: 'fa-folder', label: '分类管理', href: '/admin/categories', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-flag', label: '举报中心', href: '/admin/reports', roles: ['ADMIN', 'SUPERADMIN', 'MODERATOR'] },
    { icon: 'fa-bell', label: '公告管理', href: '/admin/announcements', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-image', label: '广告位管理', href: '/admin/adslots', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-file', label: '页面管理', href: '/admin/pages', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-medal', label: '勋章管理', href: '/admin/badges', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-store', label: '商品管理', href: '/admin/shop', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-ticket-alt', label: '邀请码管理', href: '/admin/invite-codes', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-credit-card', label: '支付配置', href: '/admin/payment', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-headset', label: '客服工作台', href: '/admin/customer-service', roles: ['ADMIN', 'SUPERADMIN', 'CUSTOMER_SERVICE'] },
    { icon: 'fa-history', label: '操作日志', href: '/admin/logs', roles: ['ADMIN', 'SUPERADMIN'] },
    { icon: 'fa-cog', label: '站点设置', href: '/admin/settings', roles: ['ADMIN', 'SUPERADMIN'] },
  ]
  const menuItems = allMenuItems.filter(item => user && item.roles.includes(user.role))

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* 侧边栏 */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 flex-shrink-0`} style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <i className="fas fa-shield-alt" style={{ color: 'var(--primary)' }}></i>
              <span className="font-bold">管理后台</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>

        <nav className="p-2 flex flex-col gap-1">
          {menuItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${isActive ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--bg-hover)]'}`}
                title={item.label}
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[var(--bg-hover)]" title="返回前台">
            <i className="fas fa-external-link-alt w-5 text-center"></i>
            {sidebarOpen && <span>返回前台</span>}
          </Link>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="h-14 flex items-center justify-between px-6" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-user-shield mr-1"></i>
              {user.role === 'SUPERADMIN' ? '超级管理员' : user.role === 'CUSTOMER_SERVICE' ? '客服' : user.role === 'MODERATOR' ? '版主' : '管理员'}: {user.nickname || user.username}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}><i className="fas fa-home mr-1"></i>前台</Link>
            {user.role === 'SUPERADMIN' && (
              <Link href="/super" className="text-sm" style={{ color: '#FFD700' }}><i className="fas fa-crown mr-1"></i>超管后台</Link>
            )}
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
