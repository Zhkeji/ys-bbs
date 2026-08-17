'use client'

export default function AdminAdSlotsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-image mr-2" style={{ color: 'var(--primary)' }}></i>广告位管理</h1>
      <div className="card p-8 text-center">
        <i className="fas fa-ad text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
        <p style={{ color: 'var(--text-muted)' }}>广告位管理 - 支持头部横幅、侧栏、帖子内信息流、页脚等位置</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>可通过API管理广告位，支持按终端(PC/移动)差异化投放</p>
      </div>
    </div>
  )
}
