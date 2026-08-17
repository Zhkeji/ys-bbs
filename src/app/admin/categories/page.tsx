'use client'

import { useState, useEffect } from 'react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: 'fas fa-folder', color: '#5E50CE', sortOrder: 0, parentId: '', isHidden: false })

  const fetchCategories = () => {
    setLoading(true)
    fetch('/api/admin/categories').then(r => r.json()).then(d => {
      if (d.code === 0) setCategories(d.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { ...form, id: editing.id } : form
    const res = await fetch('/api/admin/categories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await res.json()
    if (d.code === 0) {
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', slug: '', description: '', icon: 'fas fa-folder', color: '#5E50CE', sortOrder: 0, parentId: '', isHidden: false })
      fetchCategories()
    } else {
      alert(d.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此分类？')) return
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
    const d = await res.json()
    if (d.code === 0) fetchCategories()
    else alert(d.message)
  }

  const openEdit = (cat: any) => {
    setEditing(cat)
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description || '',
      icon: cat.icon || 'fas fa-folder', color: cat.color || '#5E50CE',
      sortOrder: cat.sortOrder, parentId: cat.parentId || '', isHidden: cat.isHidden,
    })
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"><i className="fas fa-folder mr-2" style={{ color: 'var(--primary)' }}></i>分类管理</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', icon: 'fas fa-folder', color: '#5E50CE', sortOrder: 0, parentId: '', isHidden: false }); setShowModal(true) }} className="btn btn-primary">
          <i className="fas fa-plus mr-1"></i>添加分类
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>图标</th>
              <th>名称</th>
              <th>URL</th>
              <th>描述</th>
              <th>帖子数</th>
              <th>版主</th>
              <th>排序</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id}>
                <td><i className={cat.icon || 'fas fa-folder'} style={{ color: cat.color }}></i></td>
                <td className="font-medium">{cat.name}</td>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{cat.slug}</td>
                <td className="text-sm max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>{cat.description || '—'}</td>
                <td>{cat._count.posts}</td>
                <td>{cat.moderators?.length || 0}</td>
                <td>{cat.sortOrder}</td>
                <td>{cat.isHidden ? <span className="badge badge-warning">隐藏</span> : <span className="badge badge-success">显示</span>}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="btn btn-secondary btn-sm"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleDelete(cat.id)} className="btn btn-danger btn-sm"><i className="fas fa-trash"></i></button>
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
            <h3 className="font-bold mb-4">{editing ? '编辑分类' : '添加分类'}</h3>
            <div className="flex flex-col gap-3">
              <div><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>名称</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>URL标识</label><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input" /></div>
              <div><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>描述</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" /></div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>图标</label><input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="input" /></div>
                <div className="w-24"><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>颜色</label><input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full h-10 rounded" /></div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>排序</label><input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="input" /></div>
                <div className="flex items-center gap-2 mt-6"><input type="checkbox" id="hidden" checked={form.isHidden} onChange={e => setForm({ ...form, isHidden: e.target.checked })} /><label htmlFor="hidden" className="text-sm">隐藏</label></div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>父分类</label>
                <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className="input">
                  <option value="">无 (顶级分类)</option>
                  {categories.filter(c => c.id !== editing?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleSave} className="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
