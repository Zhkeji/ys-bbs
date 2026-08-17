'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', inviteCode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('两次密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          inviteCode: form.inviteCode || undefined,
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        window.location.href = '/'
      } else {
        setError(data.message)
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            <span style={{ color: 'var(--primary)' }}>YS</span> 系统圈论坛
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>创建新账号</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
            <i className="fas fa-exclamation-circle mr-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>用户名</label>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input" placeholder="2-20个字符" required />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>邮箱</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>密码</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="至少6位" required />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>确认密码</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="input" placeholder="再次输入密码" required />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>邀请码 (可选)</label>
            <input type="text" value={form.inviteCode} onChange={e => setForm({ ...form, inviteCode: e.target.value })} className="input" placeholder="如有请输入邀请码" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : '注册'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          已有账号？ <Link href="/login" style={{ color: 'var(--primary-light)' }}>立即登录</Link>
        </div>
      </div>
    </div>
  )
}
