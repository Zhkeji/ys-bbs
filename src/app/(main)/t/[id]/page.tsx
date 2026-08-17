'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/posts/${params.id}`).then(r => r.json()).then(d => {
      if (d.code === 0) setPost(d.data)
    }).finally(() => setLoading(false))

    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.code === 0) setUser(d.data)
    }).catch(() => {})
  }, [params.id])

  const handleLike = async () => {
    if (!user) { window.location.href = '/login'; return }
    const res = await fetch('/api/posts/' + params.id + '/like', { method: 'POST' })
    const d = await res.json()
    if (d.code === 0) {
      setPost((p: any) => ({ ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }))
    }
  }

  const handleFavorite = async () => {
    if (!user) { window.location.href = '/login'; return }
    const res = await fetch('/api/posts/' + params.id + '/favorite', { method: 'POST' })
    const d = await res.json()
    if (d.code === 0) {
      setPost((p: any) => ({ ...p, isFavorited: !p.isFavorited }))
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    if (!user) { window.location.href = '/login'; return }

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment, postId: params.id, parentId: replyTo }),
    })
    const d = await res.json()
    if (d.code === 0) {
      setComment('')
      setReplyTo(null)
      // Reload post
      const refreshed = await fetch(`/api/posts/${params.id}`).then(r => r.json())
      if (refreshed.code === 0) setPost(refreshed.data)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
  }

  if (!post) {
    return <div className="text-center py-20"><p style={{ color: 'var(--text-muted)' }}>帖子不存在或已被删除</p></div>
  }

  const getRoleBadge = (role: string) => {
    const map: Record<string, { label: string; class: string }> = {
      SUPERADMIN: { label: '超管', class: 'role-superadmin' },
      ADMIN: { label: '管理', class: 'role-admin' },
      MODERATOR: { label: '版主', class: 'role-moderator' },
      CUSTOMER_SERVICE: { label: '客服', class: 'role-customer_service' },
    }
    const r = map[role]
    return r ? <span className={`badge ${r.class}`}>{r.label}</span> : null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        <Link href="/">首页</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link href={`/c/${post.category.slug}`}>{post.category.name}</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span>{post.title}</span>
      </div>

      {/* 帖子内容 */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          {post.isPinned && <span className="badge badge-warning"><i className="fas fa-thumbtack mr-1"></i>置顶</span>}
          {post.isFeatured && <span className="badge badge-success"><i className="fas fa-star mr-1"></i>精华</span>}
          <span className="badge" style={{ background: `${post.category.color}20`, color: post.category.color }}>{post.category.name}</span>
        </div>

        <h1 className="text-xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <Link href={`/u/${post.author.username}`}>
            <img src={post.author.avatar || '/static/default-avatar.png'} className="w-10 h-10 rounded-full" alt="" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/u/${post.author.username}`} className="font-medium text-sm">{post.author.nickname || post.author.username}</Link>
              {getRoleBadge(post.author.role)}
              {post.author.title && <span style={{ color: 'var(--primary-light)' }}>[{post.author.title}]</span>}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Lv.{post.author.level} · {post.author.points}积分 · {new Date(post.createdAt).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>

        {/* 帖子正文 */}
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            {post.tags.map((tag: string, i: number) => (
              <span key={i} className="badge badge-primary">{tag}</span>
            ))}
          </div>
        )}

        {/* 操作栏 */}
        <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLike} className={`btn btn-sm ${post.isLiked ? 'btn-primary' : 'btn-secondary'}`}>
            <i className={`fas fa-heart`}></i>{post.likeCount}
          </button>
          <button onClick={handleFavorite} className={`btn btn-sm ${post.isFavorited ? 'btn-primary' : 'btn-secondary'}`}>
            <i className="fas fa-star"></i>{post.isFavorited ? '已收藏' : '收藏'}
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <i className="fas fa-eye mr-1"></i>{post.viewCount} 浏览
          </span>
        </div>
      </div>

      {/* 评论区 */}
      <div className="card p-6">
        <h2 className="font-bold mb-4">
          <i className="fas fa-comments mr-2" style={{ color: 'var(--primary)' }}></i>
          评论 ({post.comments?.length || 0})
        </h2>

        {/* 评论列表 */}
        <div className="flex flex-col gap-4 mb-6">
          {post.comments?.map((c: any) => (
            <div key={c.id} className="flex gap-3">
              <img src={c.author.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{c.author.nickname || c.author.username}</span>
                  {getRoleBadge(c.author.role)}
                  {c.author.title && <span className="text-xs" style={{ color: 'var(--primary-light)' }}>[{c.author.title}]</span>}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-sm mb-2">{c.content}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <button onClick={() => setReplyTo(c.id)}><i className="fas fa-reply mr-1"></i>回复</button>
                  <span><i className="fas fa-heart mr-1"></i>{c._count?.likes || 0}</span>
                </div>

                {/* 子回复 */}
                {c.replies?.length > 0 && (
                  <div className="mt-3 pl-4" style={{ borderLeft: '2px solid var(--border)' }}>
                    {c.replies.map((r: any) => (
                      <div key={r.id} className="flex gap-2 mb-2">
                        <img src={r.author.avatar || '/static/default-avatar.png'} className="w-6 h-6 rounded-full" alt="" />
                        <div>
                          <span className="text-xs font-medium">{r.author.nickname || r.author.username}</span>
                          {getRoleBadge(r.author.role)}
                          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleString('zh-CN')}</span>
                          <p className="text-sm mt-1">{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 发表评论 */}
        <form onSubmit={handleSubmitComment}>
          {replyTo && (
            <div className="mb-2 p-2 rounded text-sm flex items-center justify-between" style={{ background: 'var(--bg)' }}>
              <span>回复评论</span>
              <button type="button" onClick={() => setReplyTo(null)} style={{ color: 'var(--error)' }}>取消</button>
            </div>
          )}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="input min-h-[100px] mb-3"
            placeholder={user ? '写下你的评论...' : '请先登录后评论'}
            disabled={!user}
          />
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={!user || !comment.trim()}>
              <i className="fas fa-paper-plane mr-1"></i>发表评论
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
