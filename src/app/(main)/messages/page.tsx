'use client'

import { useState, useEffect } from 'react'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/messages').then(r => r.json()).then(d => {
      if (d.code === 0) setConversations(d.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">
        <i className="fas fa-envelope mr-2" style={{ color: 'var(--primary)' }}></i>私信
      </h1>

      {loading ? (
        <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
      ) : conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-envelope-open text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>暂无私信</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {conversations.map((conv: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-4 hover:bg-[var(--bg-hover)] cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }}>
              <img src={conv.avatar || '/static/default-avatar.png'} className="w-10 h-10 rounded-full" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{conv.nickname || conv.username}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{conv.lastMessageAt}</span>
                </div>
              </div>
              {conv.unreadCount > 0 && <span className="badge badge-error">{conv.unreadCount}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
