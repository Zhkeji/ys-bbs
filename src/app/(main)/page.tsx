'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  _count: { posts: number }
  children?: Category[]
}

interface Post {
  id: string
  title: string
  excerpt?: string
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isFeatured: boolean
  tags?: string[]
  createdAt: string
  author: { id: string; username: string; nickname?: string; avatar?: string; role: string; title?: string; level: number }
  category: { id: string; name: string; slug: string; icon?: string; color?: string }
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, posts: 0, comments: 0 })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (d.code === 0) setCategories(d.data) })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '20', sort })
    if (activeCategory) params.set('category', activeCategory)

    fetch(`/api/posts?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) {
        setPosts(d.data.items)
        setTotalPages(d.data.totalPages)
      }
    }).finally(() => setLoading(false))
  }, [page, sort, activeCategory])

  const getRoleBadge = (role: string) => {
    const map: Record<string, { label: string; class: string }> = {
      SUPERADMIN: { label: '超管', class: 'role-superadmin' },
      ADMIN: { label: '管理', class: 'role-admin' },
      MODERATOR: { label: '版主', class: 'role-moderator' },
      CUSTOMER_SERVICE: { label: '客服', class: 'role-customer_service' },
    }
    const r = map[role]
    if (!r) return null
    return <span className={`badge ${r.class}`}>{r.label}</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 欢迎横幅 */}
      <div className="card p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(94,80,206,0.15), rgba(94,80,206,0.05))' }}>
        <h1 className="text-2xl font-bold mb-2">
          <i className="fas fa-gamepad mr-2" style={{ color: 'var(--primary)' }}></i>
          欢迎来到YS电竞圈！
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          LOL / 王者荣耀 / CS2 / 原神 / Steam 全品类电竞交流社区 — 开黑组队 · 攻略分享 · 游戏代练 · 装备交易
        </p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span><i className="fas fa-users mr-1"></i>玩家: {stats.users || '—'}</span>
          <span><i className="fas fa-file-alt mr-1"></i>帖子: {stats.posts || '—'}</span>
          <span><i className="fas fa-comments mr-1"></i>评论: {stats.comments || '—'}</span>
          <span><i className="fas fa-qq mr-1"></i>开黑群: 146732405</span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 左侧分类导航 */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="card p-4 sticky top-20">
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-list mr-2"></i>板块分类
            </h3>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => { setActiveCategory(''); setPage(1) }}
                className={`text-left px-3 py-2 rounded text-sm transition-colors ${!activeCategory ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--bg-hover)]'}`}
              >
                <i className="fas fa-globe mr-2"></i>全部帖子
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.slug); setPage(1) }}
                  className={`text-left px-3 py-2 rounded text-sm transition-colors ${activeCategory === cat.slug ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--bg-hover)]'}`}
                >
                  <i className={`${cat.icon || 'fas fa-folder'} mr-2`} style={{ color: cat.color }}></i>
                  {cat.name}
                  <span className="float-right text-xs" style={{ color: 'var(--text-muted)' }}>{cat._count.posts}</span>
                </button>
              ))}
            </nav>

            {/* 友情链接 */}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                <i className="fas fa-link mr-2"></i>友情链接
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <a href="https://bing.com/" target="_blank" rel="noopener" style={{ color: '#888' }}>Bing搜索</a>
                <a href="https://rvit.top" target="_blank" rel="noopener" style={{ color: '#888' }}>RVIT论坛</a>
                <a href="https://zdybbs.top" target="_blank" rel="noopener" style={{ color: '#888' }}>ZDY论坛</a>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <div className="flex-1 min-w-0">
          {/* 排序和发帖按钮 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[
                { key: 'latest', label: '最新', icon: 'fa-clock' },
                { key: 'hot', label: '热门', icon: 'fa-fire' },
                { key: 'comments', label: '最多评论', icon: 'fa-comments' },
                { key: 'likes', label: '最多点赞', icon: 'fa-heart' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => { setSort(s.key); setPage(1) }}
                  className={`btn btn-sm ${sort === s.key ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <i className={`fas ${s.icon} mr-1`}></i>{s.label}
                </button>
              ))}
            </div>
            <Link href="/new" className="btn btn-primary">
              <i className="fas fa-pen mr-1"></i>发帖
            </Link>
          </div>

          {/* 移动端分类选择 */}
          <div className="lg:hidden mb-4">
            <select
              value={activeCategory}
              onChange={e => { setActiveCategory(e.target.value); setPage(1) }}
              className="input"
            >
              <option value="">全部帖子</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 帖子列表 */}
          {loading ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i>
              <p className="mt-2" style={{ color: 'var(--text-muted)' }}>加载中...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card p-12 text-center">
              <i className="fas fa-inbox text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
              <p style={{ color: 'var(--text-muted)' }}>暂无帖子</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {posts.map(post => (
                <Link key={post.id} href={`/t/${post.id}`} className="card p-4 flex gap-4 group">
                  <img
                    src={post.author.avatar || '/static/default-avatar.png'}
                    className="w-10 h-10 rounded-full flex-shrink-0 mt-1"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isPinned && <span className="badge badge-warning"><i className="fas fa-thumbtack mr-1"></i>置顶</span>}
                      {post.isFeatured && <span className="badge badge-success"><i className="fas fa-star mr-1"></i>精华</span>}
                      <span className="badge" style={{ background: `${post.category.color}20`, color: post.category.color }}>
                        {post.category.name}
                      </span>
                    </div>
                    <h3 className="font-medium text-[15px] mb-1 group-hover:text-[var(--primary-light)] transition-colors truncate">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm mb-2 truncate" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>
                        {post.author.nickname || post.author.username}
                        {getRoleBadge(post.author.role)}
                        {post.author.title && <span className="ml-1" style={{ color: 'var(--primary-light)' }}>[{post.author.title}]</span>}
                      </span>
                      <span><i className="fas fa-eye mr-1"></i>{post.viewCount}</span>
                      <span><i className="fas fa-heart mr-1"></i>{post.likeCount}</span>
                      <span><i className="fas fa-comment mr-1"></i>{post.commentCount}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination justify-center mt-6">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                <i className="fas fa-chevron-left"></i>
              </button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
