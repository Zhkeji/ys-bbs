'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CSLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', password: '', email: '', nickname: '', inviteCode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password, csMode: true }),
      })
      const data = await res.json()
      if (data.code === 0) {
        window.location.href = '/admin/customer-service'
      } else {
        setError(data.message)
      }
    } catch { setError('网络错误') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.inviteCode) { setError('请输入客服邀请码'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/cs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.code === 0) {
        window.location.href = '/admin/customer-service'
      } else {
        setError(data.message)
      }
    } catch { setError('网络错误') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5E50CE, #7B6FD6)' }}>
            <i className="fas fa-headset text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold">YS 客服中心</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? '客服人员登录' : '客服人员注册'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
            <i className="fas fa-exclamation-circle mr-2"></i>{error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>用户名</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input" placeholder="请输入用户名" required />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>密码</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="请输入密码" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-sign-in-alt mr-2"></i>登录</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>客服邀请码</label>
              <input type="text" value={form.inviteCode} onChange={e => setForm({ ...form, inviteCode: e.target.value })} className="input" placeholder="由超级管理员提供的邀请码" required />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>用户名</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input" placeholder="2-20个字符" required />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>邮箱</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>昵称</label>
              <input type="text" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="input" placeholder="显示名称" />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>密码</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="至少6位" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-user-plus mr-2"></i>注册</>}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>还没有账号？ <button onClick={() => setMode('register')} style={{ color: 'var(--primary-light)' }}>申请客服入驻</button></>
          ) : (
            <>已有账号？ <button onClick={() => setMode('login')} style={{ color: 'var(--primary-light)' }}>立即登录</button></>
          )}
        </div>

        <div className="mt-4 pt-4 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <Link href="/">← 返回YS系统圈论坛</Link>
        </div>
      </div>
    </div>
  )
}
