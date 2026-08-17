'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState('latest')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '20', sort })
    if (category) params.set('category', category)
    if (search) params.set('q', search)

    fetch(`/api/shop/products?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) {
        setProducts(d.data.items)
        setTotalPages(d.data.totalPages)
      }
    }).finally(() => setLoading(false))
  }, [page, sort, category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    // Trigger refetch
    setLoading(true)
    const params = new URLSearchParams({ page: '1', pageSize: '20', sort })
    if (category) params.set('category', category)
    if (search) params.set('q', search)
    fetch(`/api/shop/products?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) { setProducts(d.data.items); setTotalPages(d.data.totalPages) }
    }).finally(() => setLoading(false))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 头部 */}
      <div className="card p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))' }}>
        <h1 className="text-2xl font-bold mb-2">
          <i className="fas fa-store mr-2" style={{ color: 'var(--accent)' }}></i>YS交易平台
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>游戏装备、账号、道具交易，平台担保安全交易</p>
      </div>

      <div className="flex gap-6">
        {/* 左侧筛选 */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="card p-4 sticky top-20">
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-filter mr-2"></i>商品分类
            </h3>
            <nav className="flex flex-col gap-1">
              {[
                { key: '', label: '全部', icon: 'fa-globe' },
                { key: 'game_account', label: '游戏账号', icon: 'fa-gamepad' },
                { key: 'game_item', label: '游戏装备', icon: 'fa-shield-alt' },
                { key: 'game_currency', label: '游戏币', icon: 'fa-coins' },
                { key: 'game_cdkey', label: 'CDK/激活码', icon: 'fa-key' },
                { key: 'service', label: '代练服务', icon: 'fa-hands-helping' },
                { key: 'other', label: '其他', icon: 'fa-ellipsis-h' },
              ].map(c => (
                <button
                  key={c.key}
                  onClick={() => { setCategory(c.key); setPage(1) }}
                  className={`text-left px-3 py-2 rounded text-sm transition-colors ${category === c.key ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-hover)]'}`}
                >
                  <i className={`fas ${c.icon} mr-2`}></i>{c.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Link href="/shop/sell" className="btn btn-primary w-full">
                <i className="fas fa-plus mr-1"></i>发布商品
              </Link>
            </div>
          </div>
        </aside>

        {/* 主内容 */}
        <div className="flex-1 min-w-0">
          {/* 搜索和排序 */}
          <div className="flex items-center gap-3 mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" placeholder="搜索商品..." />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}></i>
              </div>
            </form>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} className="input w-auto">
              <option value="latest">最新发布</option>
              <option value="sales">销量最高</option>
              <option value="price_asc">价格从低到高</option>
              <option value="price_desc">价格从高到低</option>
            </select>
          </div>

          {/* 商品网格 */}
          {loading ? (
            <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <i className="fas fa-box-open text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
              <p style={{ color: 'var(--text-muted)' }}>暂无商品</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Link key={product.id} href={`/shop/product/${product.id}`} className="card overflow-hidden group">
                  <div className="aspect-[4/3] bg-[var(--bg)] flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                    ) : (
                      <i className="fas fa-image text-3xl" style={{ color: 'var(--text-muted)' }}></i>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-2 truncate group-hover:text-[var(--accent)] transition-colors">{product.title}</h3>
                    {product.gameName && (
                      <span className="badge badge-primary mb-2">{product.gameName}</span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>¥{product.price.toFixed(2)}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>已售 {product.sales}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <img src={product.seller.avatar || '/static/default-avatar.png'} className="w-4 h-4 rounded-full" alt="" />
                      <span>{product.seller.nickname || product.seller.username}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination justify-center mt-6">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><i className="fas fa-chevron-left"></i></button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><i className="fas fa-chevron-right"></i></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
