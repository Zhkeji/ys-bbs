'use client'

import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className = '', hover = true, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${hover ? 'hover:scale-[1.01] hover:shadow-2xl cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(20, 20, 35, 0.6)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* 毛玻璃反光条 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
        }}
      />
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
