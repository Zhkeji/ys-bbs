'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ nickname: '', bio: '', avatar: '', qq: '', wechat: '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.code === 0) {
        setUser(d.data)
        setForm({
          nickname: d.data.nickname || '',
          bio: d.data.bio || '',
          avatar: d.data.avatar || '',
          qq: '',
          wechat: '',
        })
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (d.code === 0) alert('个人资料已更新')
    else alert(d.message)
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirm) {
      alert('两次密码不一致')
      return
    }
    setSaving(true)
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'changePassword', ...passwordForm }),
    })
    const d = await res.json()
    if (d.code === 0) { alert('密码已更新'); setPasswordForm({ current: '', newPassword: '', confirm: '' }) }
    else alert(d.message)
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-cog mr-2" style={{ color: 'var(--primary)' }}></i>个人设置</h1>

      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-4">个人资料</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>头像URL</label>
            <div className="flex items-center gap-3">
              <img src={form.avatar || '/static/default-avatar.png'} className="w-12 h-12 rounded-full" alt="" />
              <input type="text" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} className="input flex-1" placeholder="输入头像URL" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>昵称</label>
            <input type="text" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>个人简介</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input" maxLength={200} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>QQ</label>
            <input type="text" value={form.qq} onChange={e => setForm({ ...form, qq: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>微信</label>
            <input type="text" value={form.wechat} onChange={e => setForm({ ...form, wechat: e.target.value })} className="input" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary self-end">
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save mr-1"></i>保存</>}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4">修改密码</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>当前密码</label>
            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>新密码</label>
            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>确认新密码</label>
            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input" />
          </div>
          <button onClick={handleChangePassword} disabled={saving} className="btn btn-primary self-end">
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-key mr-1"></i>修改密码</>}
          </button>
        </div>
      </div>
    </div>
  )
}
