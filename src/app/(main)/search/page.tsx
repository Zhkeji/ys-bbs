'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (q) {
      setLoading(true)
      fetch(`/api/posts?q=${encodeURIComponent(q)}&pageSize=50`).then(r => r.json()).then(d => {
        if (d.code === 0) setPosts(d.data.items)
      }).finally(() => setLoading(false))
    }
  }, [q])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">
        <i className="fas fa-search mr-2" style={{ color: 'var(--primary)' }}></i>
        搜索结果: "{q}"
      </h1>

      {loading ? (
        <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-search text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>未找到相关帖子</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map(post => (
            <Link key={post.id} href={`/t/${post.id}`} className="card p-4 group">
              <h3 className="font-medium mb-1 group-hover:text-[var(--primary-light)] transition-colors">{post.title}</h3>
              {post.excerpt && <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p>}
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{post.author?.username}</span>
                <span><i className="fas fa-eye mr-1"></i>{post.viewCount}</span>
                <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
