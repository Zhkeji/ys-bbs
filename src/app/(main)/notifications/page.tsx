'use client'

import { useState, useEffect } from 'react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications?pageSize=50').then(r => r.json()).then(d => {
      if (d.code === 0) {
        setNotifications(d.data.items)
        setUnreadCount(d.data.unreadCount)
      }
    }).finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setNotifications(n => n.map(item => ({ ...item, isRead: true })))
    setUnreadCount(0)
  }

  const typeIcons: Record<string, string> = {
    SYSTEM: 'fa-cog',
    POST_LIKE: 'fa-heart',
    POST_COMMENT: 'fa-comment',
    COMMENT_LIKE: 'fa-heart',
    MENTION: 'fa-at',
    ORDER: 'fa-shopping-cart',
    REPORT_RESULT: 'fa-flag',
    ANNOUNCEMENT: 'fa-bullhorn',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          <i className="fas fa-bell mr-2" style={{ color: 'var(--primary)' }}></i>
          通知 {unreadCount > 0 && <span className="badge badge-error ml-2">{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary btn-sm">
            <i className="fas fa-check-double mr-1"></i>全部已读
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-bell-slash text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>暂无通知</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(notif => (
            <div key={notif.id} className={`card p-4 ${!notif.isRead ? 'border-l-2' : ''}`} style={!notif.isRead ? { borderLeftColor: 'var(--primary)' } : {}}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg)' }}>
                  <i className={`fas ${typeIcons[notif.type] || 'fa-bell'} text-sm`} style={{ color: 'var(--primary)' }}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{notif.title}</p>
                  {notif.content && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{notif.content}</p>}
                  <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>{new Date(notif.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--primary)' }}></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
