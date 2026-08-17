'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  username: string
  nickname?: string
  avatar?: string
  role: string
  title?: string
  points?: number
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.code === 0) setUser(d.data) })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(15, 15, 20, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span style={{ color: 'var(--primary)' }}>YS</span>
            <span>系统圈论坛</span>
          </Link>

          {/* 搜索栏 - 桌面端 */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索帖子..."
                className="input pl-10 pr-4 py-2 text-sm"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}></i>
            </div>
          </form>

          {/* 导航 - 桌面端 */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-home mr-1"></i>首页
            </Link>
            <Link href="/shop" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-store mr-1"></i>交易
            </Link>

            {user ? (
              <>
                <Link href="/notifications" className="relative text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <i className="fas fa-bell"></i>
                </Link>
                <Link href="/messages" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <i className="fas fa-envelope"></i>
                </Link>
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2">
                    <img src={user.avatar || '/static/default-avatar.png'} className="w-7 h-7 rounded-full" alt="" />
                    <span className="text-sm">{user.nickname || user.username}</span>
                    {user.role !== 'USER' && (
                      <span className={`badge role-${user.role.toLowerCase()}`}>
                        {user.role === 'SUPERADMIN' ? '超管' : user.role === 'ADMIN' ? '管理' : user.role === 'CUSTOMER_SERVICE' ? '客服' : '版主'}
                      </span>
                    )}
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 card p-2 fade-in">
                      <Link href={`/u/${user.username}`} className="block px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">
                        <i className="fas fa-user mr-2"></i>个人主页
                      </Link>
                      <Link href="/settings" className="block px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">
                        <i className="fas fa-cog mr-2"></i>设置
                      </Link>
                      {['ADMIN', 'SUPERADMIN', 'MODERATOR', 'CUSTOMER_SERVICE'].includes(user.role) && (
                        <Link href="/admin" className="block px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">
                          <i className="fas fa-shield-alt mr-2"></i>{user.role === 'CUSTOMER_SERVICE' ? '客服工作台' : '管理后台'}
                        </Link>
                      )}
                      {user.role === 'SUPERADMIN' && (
                        <Link href="/super" className="block px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">
                          <i className="fas fa-crown mr-2"></i>超管后台
                        </Link>
                      )}
                      <hr className="my-1" style={{ borderColor: 'var(--border)' }} />
                      <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--error)' }}>
                        <i className="fas fa-sign-out-alt mr-2"></i>退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-secondary btn-sm">登录</Link>
                <Link href="/register" className="btn btn-primary btn-sm">注册</Link>
              </div>
            )}
          </nav>

          {/* 移动端菜单按钮 */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-xl" style={{ color: 'var(--text-muted)' }}>
            <i className={showMobileMenu ? 'fas fa-times' : 'fas fa-bars'}></i>
          </button>
        </div>

        {/* 移动端菜单 */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t fade-in" style={{ borderColor: 'var(--border)' }}>
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索帖子..."
                className="input text-sm"
              />
            </form>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">首页</Link>
              <Link href="/shop" className="px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">交易</Link>
              {user ? (
                <>
                  <Link href={`/u/${user.username}`} className="px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">个人主页</Link>
                  <Link href="/notifications" className="px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">通知</Link>
                  <Link href="/messages" className="px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">私信</Link>
                  {['ADMIN', 'SUPERADMIN', 'MODERATOR', 'CUSTOMER_SERVICE'].includes(user.role) && (
                    <Link href="/admin" className="px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">{user.role === 'CUSTOMER_SERVICE' ? '客服工作台' : '管理后台'}</Link>
                  )}
                  {user.role === 'SUPERADMIN' && (
                    <Link href="/super" className="px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]">超管后台</Link>
                  )}
                  <button onClick={handleLogout} className="text-left px-3 py-2 text-sm rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--error)' }}>退出登录</button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="btn btn-secondary btn-sm flex-1">登录</Link>
                  <Link href="/register" className="btn btn-primary btn-sm flex-1">注册</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
