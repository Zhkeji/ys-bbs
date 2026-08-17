'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [pendingReports, setPendingReports] = useState(0)

  useEffect(() => {
    // Fetch dashboard data
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()).catch(() => ({ data: {} })),
      fetch('/api/posts?pageSize=5').then(r => r.json()),
      fetch('/api/admin/users?pageSize=5').then(r => r.json()),
      fetch('/api/reports?status=PENDING&pageSize=1').then(r => r.json()),
    ]).then(([statsData, postsData, usersData, reportsData]) => {
      if (statsData.code === 0) setStats(statsData.data)
      if (postsData.code === 0) setRecentPosts(postsData.data.items)
      if (usersData.code === 0) setRecentUsers(usersData.data.items)
      if (reportsData.code === 0) setPendingReports(reportsData.data.total)
    })
  }, [])

  const statCards = [
    { icon: 'fa-users', label: '总用户', value: stats.totalUsers || 0, color: '#5E50CE' },
    { icon: 'fa-file-alt', label: '总帖子', value: stats.totalPosts || 0, color: '#22c55e' },
    { icon: 'fa-comment', label: '总评论', value: stats.totalComments || 0, color: '#f59e0b' },
    { icon: 'fa-store', label: '总商品', value: stats.totalProducts || 0, color: '#FF6B35' },
    { icon: 'fa-shopping-cart', label: '总订单', value: stats.totalOrders || 0, color: '#4a90e2' },
    { icon: 'fa-flag', label: '待处理举报', value: pendingReports, color: '#ef4444' },
    { icon: 'fa-user-plus', label: '今日注册', value: stats.todayUsers || 0, color: '#8b5cf6' },
    { icon: 'fa-edit', label: '今日发帖', value: stats.todayPosts || 0, color: '#06b6d4' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-tachometer-alt mr-2" style={{ color: 'var(--primary)' }}></i>仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${card.color}20` }}>
                <i className={`fas ${card.icon}`} style={{ color: card.color }}></i>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最新帖子 */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold"><i className="fas fa-file-alt mr-2" style={{ color: 'var(--primary)' }}></i>最新帖子</h2>
            <Link href="/admin/posts" className="text-sm" style={{ color: 'var(--primary-light)' }}>查看全部</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentPosts.map((post: any) => (
              <div key={post.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <Link href={`/t/${post.id}`} className="text-sm truncate block hover:text-[var(--primary-light)]">{post.title}</Link>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.author?.username} · {new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span><i className="fas fa-eye mr-1"></i>{post.viewCount}</span>
                  {!post.isApproved && <span className="badge badge-warning">待审</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最新用户 */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold"><i className="fas fa-users mr-2" style={{ color: 'var(--primary)' }}></i>最新用户</h2>
            <Link href="/admin/users" className="text-sm" style={{ color: 'var(--primary-light)' }}>查看全部</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <img src={u.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <span className="text-sm">{u.nickname || u.username}</span>
                    <span className={`badge ml-2 role-${u.role.toLowerCase()}`}>
                      {u.role === 'SUPERADMIN' ? '超管' : u.role === 'ADMIN' ? '管理' : u.role === 'MODERATOR' ? '版主' : u.role === 'CUSTOMER_SERVICE' ? '客服' : '用户'}
                    </span>
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="card p-4 mt-6">
        <h2 className="font-bold mb-4"><i className="fas fa-bolt mr-2" style={{ color: 'var(--accent)' }}></i>快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users" className="btn btn-secondary"><i className="fas fa-users mr-1"></i>用户管理</Link>
          <Link href="/admin/posts" className="btn btn-secondary"><i className="fas fa-file-alt mr-1"></i>帖子管理</Link>
          <Link href="/admin/reports" className="btn btn-secondary"><i className="fas fa-flag mr-1"></i>举报中心</Link>
          <Link href="/admin/announcements" className="btn btn-secondary"><i className="fas fa-bullhorn mr-1"></i>发布公告</Link>
          <Link href="/admin/settings" className="btn btn-secondary"><i className="fas fa-cog mr-1"></i>站点设置</Link>
          <Link href="/admin/logs" className="btn btn-secondary"><i className="fas fa-history mr-1"></i>操作日志</Link>
        </div>
      </div>
    </div>
  )
}
