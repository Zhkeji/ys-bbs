'use client'

import { useState, useEffect } from 'react'

export default function SuperAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'ADMIN', nickname: '' })

  const fetchAdmins = () => {
    setLoading(true)
    fetch('/api/super/admins').then(r => r.json()).then(d => {
      if (d.code === 0) setAdmins(d.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/super/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (d.code === 0) {
      setShowModal(false)
      setForm({ username: '', email: '', password: '', role: 'ADMIN', nickname: '' })
      fetchAdmins()
    } else {
      alert(d.message)
    }
  }

  const handleAction = async (userId: string, action: string, data?: any) => {
    const res = await fetch('/api/super/admins', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, data }),
    })
    const d = await res.json()
    if (d.code === 0) fetchAdmins()
    else alert(d.message)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"><i className="fas fa-user-shield mr-2" style={{ color: '#FFD700' }}></i>管理员管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <i className="fas fa-plus mr-1"></i>添加管理员
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>用户</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>头衔</th>
              <th>最后登录</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
            ) : admins.map(admin => (
              <tr key={admin.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <img src={admin.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                    <span>{admin.nickname || admin.username}</span>
                  </div>
                </td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{admin.email}</td>
                <td>
                  <span className={`badge role-${admin.role.toLowerCase()}`}>
                    {admin.role === 'ADMIN' ? '管理员' : '版主'}
                  </span>
                </td>
                <td className="text-sm">{admin.title || '—'}</td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('zh-CN') : '从未登录'}
                </td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(admin.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => {
                      const newTitle = prompt('输入新头衔:', admin.title || '')
                      if (newTitle !== null) handleAction(admin.id, 'setTitle', { title: newTitle })
                    }} className="btn btn-secondary btn-sm" title="设置头衔">
                      <i className="fas fa-tag"></i>
                    </button>
                    <button onClick={() => {
                      const newRole = admin.role === 'ADMIN' ? 'MODERATOR' : 'ADMIN'
                      if (confirm(`确认将 ${admin.nickname || admin.username} 的角色更改为 ${newRole === 'ADMIN' ? '管理员' : '版主'}？`)) {
                        handleAction(admin.id, 'setRole', { role: newRole })
                      }
                    }} className="btn btn-secondary btn-sm" title="切换角色">
                      <i className="fas fa-user-shield"></i>
                    </button>
                    <button onClick={() => {
                      const newPass = prompt('输入新密码 (留空使用默认123456):')
                      handleAction(admin.id, 'resetPassword', { password: newPass || '123456' })
                    }} className="btn btn-secondary btn-sm" title="重置密码">
                      <i className="fas fa-key"></i>
                    </button>
                    <button onClick={() => {
                      if (confirm(`确认删除管理员 ${admin.nickname || admin.username}？`)) {
                        handleAction(admin.id, 'delete')
                      }
                    }} className="btn btn-danger btn-sm" title="删除">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 添加管理员弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4"><i className="fas fa-user-plus mr-2" style={{ color: '#FFD700' }}></i>添加管理员</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>用户名</label>
                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>邮箱</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>密码</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="至少6位" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>昵称</label>
                <input type="text" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>角色</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input">
                  <option value="ADMIN">管理员</option>
                  <option value="MODERATOR">版主</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleCreate} className="btn btn-primary">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
