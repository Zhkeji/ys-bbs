'use client'

import { useState, useEffect } from 'react'

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', type: 'info', isActive: true, startsAt: '', expiresAt: '' })

  useEffect(() => {
    fetch('/api/admin/announcements').then(r => r.json()).then(d => {
      if (d.code === 0) setItems(d.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (d.code === 0) { setShowModal(false); window.location.reload() }
    else alert(d.message)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"><i className="fas fa-bullhorn mr-2" style={{ color: 'var(--primary)' }}></i>公告管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary"><i className="fas fa-plus mr-1"></i>发布公告</button>
      </div>

      <div className="card p-8 text-center">
        <i className="fas fa-bullhorn text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
        <p style={{ color: 'var(--text-muted)' }}>公告管理功能已就绪，可通过API管理公告</p>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">发布公告</h3>
            <div className="flex flex-col gap-3">
              <div><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>标题</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" /></div>
              <div><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>内容</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input min-h-[100px]" /></div>
              <div><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>类型</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input">
                  <option value="info">信息</option><option value="warning">警告</option><option value="success">成功</option><option value="error">错误</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleCreate} className="btn btn-primary">发布</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
