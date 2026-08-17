'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SuperDashboard() {
  const [stats, setStats] = useState<any>({})
  const [systemInfo, setSystemInfo] = useState<any>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()).catch(() => ({ data: {} })),
      fetch('/api/super/system').then(r => r.json()).catch(() => ({ data: {} })),
    ]).then(([s, sys]) => {
      if (s.code === 0) setStats(s.data)
      if (sys.code === 0) setSystemInfo(sys.data)
    })
  }, [])

  const statCards = [
    { icon: 'fa-users', label: '总用户', value: stats.totalUsers || 0, color: '#FFD700', href: '/admin/users' },
    { icon: 'fa-file-alt', label: '总帖子', value: stats.totalPosts || 0, color: '#22c55e', href: '/admin/posts' },
    { icon: 'fa-comment', label: '总评论', value: stats.totalComments || 0, color: '#4a90e2', href: '/admin/posts' },
    { icon: 'fa-store', label: '总商品', value: stats.totalProducts || 0, color: '#FF6B35', href: '/admin/shop' },
    { icon: 'fa-shopping-cart', label: '总订单', value: stats.totalOrders || 0, color: '#8b5cf6', href: '/admin/shop' },
    { icon: 'fa-flag', label: '待处理举报', value: stats.pendingReports || 0, color: '#ef4444', href: '/admin/reports' },
    { icon: 'fa-user-shield', label: '管理员数', value: stats.adminCount || 0, color: '#f59e0b', href: '/super/admins' },
    { icon: 'fa-ticket-alt', label: '邀请码数', value: stats.inviteCodes || 0, color: '#06b6d4', href: '/admin/invite-codes' },
  ]

  const quickActions = [
    { icon: 'fa-globe', label: '站点配置', href: '/super/site', color: '#FFD700' },
    { icon: 'fa-user-shield', label: '管理员管理', href: '/super/admins', color: '#FF6B35' },
    { icon: 'fa-user-tag', label: '角色权限', href: '/super/roles', color: '#5E50CE' },
    { icon: 'fa-palette', label: '主题模板', href: '/super/templates', color: '#22c55e' },
    { icon: 'fa-database', label: '数据备份', href: '/super/backup', color: '#4a90e2' },
    { icon: 'fa-server', label: '系统信息', href: '/super/system', color: '#8b5cf6' },
    { icon: 'fa-history', label: '操作日志', href: '/super/logs', color: '#06b6d4' },
    { icon: 'fa-cog', label: '高级设置', href: '/super/settings', color: '#f59e0b' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-crown mr-2" style={{ color: '#FFD700' }}></i>超管总览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className="card p-4 group hover:border-[rgba(255,215,0,0.3)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${card.color}20` }}>
                <i className={`fas ${card.icon}`} style={{ color: card.color }}></i>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-4"><i className="fas fa-bolt mr-2" style={{ color: '#FFD700' }}></i>超管快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} className="card p-4 text-center group hover:border-[rgba(255,215,0,0.3)]">
              <i className={`fas ${action.icon} text-2xl mb-2`} style={{ color: action.color }}></i>
              <p className="text-sm">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 系统状态 */}
      <div className="card p-6">
        <h2 className="font-bold mb-4"><i className="fas fa-server mr-2" style={{ color: '#FFD700' }}></i>系统状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>数据库状态</p>
            <p className="font-bold"><span className="badge badge-success">正常</span></p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>服务器运行时间</p>
            <p className="font-bold">{systemInfo.uptime || '—'}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Node.js 版本</p>
            <p className="font-bold">{systemInfo.nodeVersion || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
