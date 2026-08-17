'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (d.code === 0) setCategories(d.data)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('请填写完整信息')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          categoryId,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        router.push(`/t/${data.data.id}`)
      } else {
        setError(data.message)
      }
    } catch {
      setError('发帖失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-pen mr-2" style={{ color: 'var(--primary)' }}></i>发表新帖</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>标题</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="请输入帖子标题" maxLength={100} required />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>分类</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input" required>
            <option value="">请选择分类</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>内容</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="input min-h-[300px]" placeholder="支持Markdown格式..." required />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>标签 (用逗号分隔)</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="input" placeholder="例如: Windows, 教程, 运维" />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">取消</button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane mr-1"></i>发表</>}
          </button>
        </div>
      </form>
    </div>
  )
}
