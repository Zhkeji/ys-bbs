'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.code === 0) {
        if (d.data.role !== 'SUPERADMIN') {
          window.location.href = '/'
          return
        }
        setUser(d.data)
      } else {
        window.location.href = '/login'
      }
    })
  }, [])

  const menuItems = [
    // 超管专属
    { icon: 'fa-tachometer-alt', label: '超管总览', href: '/super' },
    { icon: 'fa-globe', label: '站点配置', href: '/super/site' },
    { icon: 'fa-user-shield', label: '管理员管理', href: '/super/admins' },
    { icon: 'fa-user-tag', label: '角色权限', href: '/super/roles' },
    { icon: 'fa-palette', label: '主题模板', href: '/super/templates' },
    { icon: 'fa-database', label: '数据备份', href: '/super/backup' },
    { icon: 'fa-server', label: '系统信息', href: '/super/system' },
    { icon: 'fa-cog', label: '高级设置', href: '/super/settings' },
    { icon: 'fa-headset', label: '客服邀请码', href: '/super/cs-codes' },
    // 管理功能（超管可直接操作）
    { icon: 'fa-users', label: '用户管理', href: '/admin/users' },
    { icon: 'fa-file-alt', label: '帖子管理', href: '/admin/posts' },
    { icon: 'fa-folder', label: '分类管理', href: '/admin/categories' },
    { icon: 'fa-flag', label: '举报中心', href: '/admin/reports' },
    { icon: 'fa-bullhorn', label: '公告管理', href: '/admin/announcements' },
    { icon: 'fa-image', label: '广告位管理', href: '/admin/adslots' },
    { icon: 'fa-file', label: '页面管理', href: '/admin/pages' },
    { icon: 'fa-medal', label: '勋章管理', href: '/admin/badges' },
    { icon: 'fa-store', label: '商品管理', href: '/admin/shop' },
    { icon: 'fa-ticket-alt', label: '邀请码管理', href: '/admin/invite-codes' },
    { icon: 'fa-credit-card', label: '支付配置', href: '/admin/payment' },
    { icon: 'fa-headset', label: '客服工作台', href: '/admin/customer-service' },
    { icon: 'fa-map-marked-alt', label: '登录IP追踪', href: '/super/login-logs' },
    { icon: 'fa-history', label: '操作日志', href: '/super/logs' },
  ]

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: '#FFD700' }}></i></div>
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* 侧边栏 */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 flex-shrink-0`} style={{ background: 'linear-gradient(180deg, #1a1520, #1a1a24)', borderRight: '1px solid rgba(255,215,0,0.2)' }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,215,0,0.2)' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <i className="fas fa-crown" style={{ color: '#FFD700' }}></i>
              <span className="font-bold" style={{ color: '#FFD700' }}>超管后台</span>
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
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${isActive ? 'text-white' : 'hover:bg-[rgba(255,215,0,0.1)]'}`}
                style={isActive ? { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' } : {}}
                title={item.label}
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 mt-auto" style={{ borderTop: '1px solid rgba(255,215,0,0.2)' }}>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[rgba(255,215,0,0.1)]" title="管理后台">
            <i className="fas fa-shield-alt w-5 text-center"></i>
            {sidebarOpen && <span>管理后台</span>}
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[rgba(255,215,0,0.1)]" title="返回前台">
            <i className="fas fa-external-link-alt w-5 text-center"></i>
            {sidebarOpen && <span>返回前台</span>}
          </Link>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-6" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <i className="fas fa-crown" style={{ color: '#FFD700' }}></i>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              超级管理员: {user.nickname || user.username}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}><i className="fas fa-home mr-1"></i>前台</Link>
            <Link href="/admin" className="text-sm" style={{ color: 'var(--primary-light)' }}><i className="fas fa-shield-alt mr-1"></i>管理后台</Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
