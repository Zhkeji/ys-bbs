'use client'

import { useState, useEffect } from 'react'

export default function SuperCSCodesPage() {
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ maxUses: 10, expiresInDays: 30 })

  const fetchCodes = () => {
    setLoading(true)
    fetch('/api/super/cs-codes').then(r => r.json()).then(d => {
      if (d.code === 0) setCodes(d.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCodes() }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/super/cs-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (d.code === 0) { setShowModal(false); fetchCodes() }
    else alert(d.message)
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch('/api/super/cs-codes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    })
    fetchCodes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此邀请码？')) return
    await fetch(`/api/super/cs-codes?id=${id}`, { method: 'DELETE' })
    fetchCodes()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"><i className="fas fa-headset mr-2" style={{ color: '#FFD700' }}></i>客服邀请码管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <i className="fas fa-plus mr-1"></i>生成邀请码
        </button>
      </div>

      <div className="card p-4 mb-4" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
        <p className="text-sm"><i className="fas fa-info-circle mr-1" style={{ color: '#06b6d4' }}></i>
          客服邀请码以 <strong>CS-</strong> 开头，客服人员使用邀请码在 <a href="/cs" style={{ color: '#06b6d4' }}>/cs</a> 页面注册。注册后自动获得客服角色，可访问客服工作台。
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>邀请码</th><th>使用/上限</th><th>状态</th><th>过期时间</th><th>创建时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
            ) : codes.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无邀请码</td></tr>
            ) : codes.map(code => (
              <tr key={code.id}>
                <td><code className="px-2 py-1 rounded text-sm font-bold" style={{ background: 'var(--bg)' }}>{code.code}</code></td>
                <td>{code.usedCount} / {code.maxUses}</td>
                <td>
                  {code.isActive && (code.usedCount < code.maxUses) && (!code.expiresAt || new Date(code.expiresAt) > new Date())
                    ? <span className="badge badge-success">可用</span>
                    : <span className="badge badge-error">不可用</span>}
                </td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString('zh-CN') : '永不过期'}
                </td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(code.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => navigator.clipboard.writeText(code.code)} className="btn btn-secondary btn-sm" title="复制">
                      <i className="fas fa-copy"></i>
                    </button>
                    <button onClick={() => handleToggle(code.id, code.isActive)} className="btn btn-secondary btn-sm" title={code.isActive ? '禁用' : '启用'}>
                      <i className={`fas ${code.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    <button onClick={() => handleDelete(code.id)} className="btn btn-danger btn-sm" title="删除">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4"><i className="fas fa-key mr-2" style={{ color: '#FFD700' }}></i>生成客服邀请码</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>最大使用次数</label>
                <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: parseInt(e.target.value) || 1 })} className="input" min={1} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>有效天数</label>
                <input type="number" value={form.expiresInDays} onChange={e => setForm({ ...form, expiresInDays: parseInt(e.target.value) || 30 })} className="input" min={1} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleCreate} className="btn btn-primary">生成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
