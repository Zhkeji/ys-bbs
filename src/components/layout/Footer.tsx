'use client'

import { useEffect, useState } from 'react'

export default function Footer() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="mt-8" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="card p-6" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
          {/* 友情链接 */}
          <div className="text-center mb-4">
            <strong style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-link mr-1"></i>友情链接
            </strong>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <a href="https://bing.com/" target="_blank" rel="noopener" className="text-sm" style={{ color: '#888' }}>
                <i className="fas fa-search mr-1"></i>Bing搜索
              </a>
              <a href="https://rvit.top" target="_blank" rel="noopener" className="text-sm" style={{ color: '#888' }}>
                <i className="fas fa-comments mr-1"></i>RVIT论坛
              </a>
              <a href="https://zdybbs.top" target="_blank" rel="noopener" className="text-sm" style={{ color: '#888' }}>
                <i className="fas fa-comments mr-1"></i>ZDY论坛
              </a>
            </div>
          </div>

          <div className="my-4" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>

          {/* 法律链接 */}
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
            <a href="/p/rules" style={{ color: '#666' }}>
              <i className="fas fa-book-open mr-1"></i>社区公约
            </a>
            <span style={{ color: '#444' }}>•</span>
            <a href="/p/privacy" style={{ color: '#666' }}>
              <i className="fas fa-user-shield mr-1"></i>隐私政策
            </a>
            <span style={{ color: '#444' }}>•</span>
            <a href="https://www.12377.cn/" target="_blank" rel="noopener" style={{ color: '#666' }}>
              <i className="fas fa-shield-alt mr-1"></i>违法和不良信息举报
            </a>
            <span style={{ color: '#444' }}>•</span>
            <span style={{ fontWeight: 600, color: '#4a4a55' }}>
              <i className="fas fa-clock mr-1" style={{ color: '#4a90e2' }}></i>
              {time}
            </span>
          </div>

          {/* 底部 */}
          <div className="text-center text-xs" style={{ color: '#999' }}>
            <span>
              <i className="fas fa-cookie-bite mr-1"></i>本站点使用 Cookies 来保证您的使用体验。
            </span>
            <span className="mx-2">•</span>
            <span>© {new Date().getFullYear()} YS系统圈论坛</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
