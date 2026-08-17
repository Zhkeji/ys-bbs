'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (status) params.set('status', status)
    if (search) params.set('q', search)
    fetch(`/api/admin/posts?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) { setPosts(d.data.items); setTotalPages(d.data.totalPages) }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [page, status])

  const handleAction = async (postId: string, action: string, data?: any) => {
    const res = await fetch('/api/admin/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action, data }),
    })
    const d = await res.json()
    if (d.code === 0) fetchPosts()
    else alert(d.message)
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-file-alt mr-2" style={{ color: 'var(--primary)' }}></i>帖子管理</h1>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchPosts()} className="input pl-10" placeholder="搜索帖子标题..." />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}></i>
            </div>
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input w-auto">
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="deleted">已删除</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>标题</th>
              <th>作者</th>
              <th>分类</th>
              <th>浏览/评论</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
            ) : posts.map(post => (
              <tr key={post.id}>
                <td>
                  <Link href={`/t/${post.id}`} className="hover:text-[var(--primary-light)] transition-colors max-w-[300px] truncate block">
                    {post.isPinned && <i className="fas fa-thumbtack mr-1 text-yellow-500"></i>}
                    {post.isFeatured && <i className="fas fa-star mr-1 text-green-500"></i>}
                    {post.title}
                  </Link>
                </td>
                <td className="text-sm">{post.author?.nickname || post.author?.username}</td>
                <td><span className="badge" style={{ background: `${post.category?.color}20`, color: post.category?.color }}>{post.category?.name}</span></td>
                <td className="text-sm">{post.viewCount} / {post.commentCount}</td>
                <td>
                  {post.isDeleted ? <span className="badge badge-error">已删除</span> :
                   !post.isApproved ? <span className="badge badge-warning">待审核</span> :
                   <span className="badge badge-success">正常</span>}
                </td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>
                  <div className="flex gap-1 flex-wrap">
                    {!post.isApproved && <button onClick={() => handleAction(post.id, 'approve')} className="btn btn-secondary btn-sm" title="通过"><i className="fas fa-check text-green-500"></i></button>}
                    {post.isApproved && <button onClick={() => handleAction(post.id, 'reject')} className="btn btn-secondary btn-sm" title="拒绝"><i className="fas fa-times text-red-500"></i></button>}
                    <button onClick={() => handleAction(post.id, 'pin', { pinned: !post.isPinned })} className={`btn btn-sm ${post.isPinned ? 'btn-primary' : 'btn-secondary'}`} title="置顶"><i className="fas fa-thumbtack"></i></button>
                    <button onClick={() => handleAction(post.id, 'feature', { featured: !post.isFeatured })} className={`btn btn-sm ${post.isFeatured ? 'btn-primary' : 'btn-secondary'}`} title="精华"><i className="fas fa-star"></i></button>
                    {post.isDeleted ? (
                      <button onClick={() => handleAction(post.id, 'restore')} className="btn btn-secondary btn-sm" title="恢复"><i className="fas fa-undo"></i></button>
                    ) : (
                      <button onClick={() => { if (confirm('确认删除？')) handleAction(post.id, 'delete') }} className="btn btn-danger btn-sm" title="删除"><i className="fas fa-trash"></i></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination justify-center mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><i className="fas fa-chevron-left"></i></button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''}>{p}</button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><i className="fas fa-chevron-right"></i></button>
        </div>
      )}
    </div>
  )
}
