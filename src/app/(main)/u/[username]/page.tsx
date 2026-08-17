'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${params.username}`).then(r => r.json()),
      fetch(`/api/posts?authorId=${params.username}`).then(r => r.json()),
    ]).then(([userData, postsData]) => {
      if (userData.code === 0) setUser(userData.data)
      if (postsData.code === 0) setPosts(postsData.data.items)
    }).finally(() => setLoading(false))
  }, [params.username])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
  }

  if (!user) {
    return <div className="text-center py-20"><p style={{ color: 'var(--text-muted)' }}>用户不存在</p></div>
  }

  const getRoleBadge = (role: string) => {
    const map: Record<string, { label: string; class: string }> = {
      SUPERADMIN: { label: '超级管理员', class: 'role-superadmin' },
      ADMIN: { label: '管理员', class: 'role-admin' },
      MODERATOR: { label: '版主', class: 'role-moderator' },
    }
    const r = map[role]
    return r ? <span className={`badge ${r.class}`}>{r.label}</span> : null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 用户信息卡片 */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <img src={user.avatar || '/static/default-avatar.png'} className="w-20 h-20 rounded-full" alt="" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{user.nickname || user.username}</h1>
              {getRoleBadge(user.role)}
              {user.title && <span style={{ color: 'var(--primary-light)' }}>[{user.title}]</span>}
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
            {user.bio && <p className="text-sm mb-3">{user.bio}</p>}
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span><i className="fas fa-star mr-1" style={{ color: '#FFD700' }}></i>Lv.{user.level}</span>
              <span><i className="fas fa-coins mr-1" style={{ color: '#FFA500' }}></i>{user.points} 积分</span>
              <span><i className="fas fa-file-alt mr-1"></i>{user.postCount} 帖子</span>
              <span><i className="fas fa-comment mr-1"></i>{user.commentCount} 评论</span>
              <span><i className="fas fa-calendar mr-1"></i>加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'posts', label: '帖子', icon: 'fa-file-alt' },
          { key: 'replies', label: '回复', icon: 'fa-comment' },
          { key: 'favorites', label: '收藏', icon: 'fa-star' },
          { key: 'badges', label: '勋章', icon: 'fa-medal' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
          >
            <i className={`fas ${tab.icon} mr-1`}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* 帖子列表 */}
      {activeTab === 'posts' && (
        <div className="flex flex-col gap-2">
          {posts.length === 0 ? (
            <div className="card p-8 text-center"><p style={{ color: 'var(--text-muted)' }}>暂无帖子</p></div>
          ) : posts.map((post: any) => (
            <Link key={post.id} href={`/t/${post.id}`} className="card p-4 group">
              <h3 className="font-medium mb-1 group-hover:text-[var(--primary-light)] transition-colors">{post.title}</h3>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span><i className="fas fa-eye mr-1"></i>{post.viewCount}</span>
                <span><i className="fas fa-heart mr-1"></i>{post.likeCount}</span>
                <span><i className="fas fa-comment mr-1"></i>{post.commentCount}</span>
                <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="card p-6 text-center">
          <i className="fas fa-medal text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>勋章系统开发中...</p>
        </div>
      )}
    </div>
  )
}
