'use client'

import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.code === 0) setSettings(d.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    const d = await res.json()
    if (d.code === 0) alert('设置已保存')
    else alert(d.message)
    setSaving(false)
  }

  const update = (key: string, value: any) => {
    setSettings((s: any) => ({ ...s, [key]: value }))
  }

  const tabs = [
    { key: 'general', label: '基本设置', icon: 'fa-cog' },
    { key: 'appearance', label: '外观设置', icon: 'fa-palette' },
    { key: 'content', label: '内容设置', icon: 'fa-file-alt' },
    { key: 'security', label: '安全设置', icon: 'fa-shield-alt' },
    { key: 'email', label: '邮件设置', icon: 'fa-envelope' },
    { key: 'seo', label: 'SEO设置', icon: 'fa-search' },
    { key: 'custom', label: '自定义代码', icon: 'fa-code' },
  ]

  if (loading) return <div className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"><i className="fas fa-cog mr-2" style={{ color: 'var(--primary)' }}></i>站点设置</h1>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save mr-1"></i>保存设置</>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* 标签页导航 */}
        <aside className="w-48 flex-shrink-0">
          <div className="card p-2 sticky top-20">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${activeTab === tab.key ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--bg-hover)]'}`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* 设置内容 */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">基本设置</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>站点名称</label>
                <input type="text" value={settings.site_name || ''} onChange={e => update('site_name', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>站点描述</label>
                <textarea value={settings.site_description || ''} onChange={e => update('site_description', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>站点URL</label>
                <input type="text" value={settings.site_url || ''} onChange={e => update('site_url', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>欢迎标题</label>
                <input type="text" value={settings.welcome_title || ''} onChange={e => update('welcome_title', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>欢迎消息</label>
                <textarea value={settings.welcome_message || ''} onChange={e => update('welcome_message', e.target.value)} className="input" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="reg_enabled" checked={settings.registration_enabled !== 'false'} onChange={e => update('registration_enabled', String(e.target.checked))} />
                <label htmlFor="reg_enabled" className="text-sm">开放注册</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="invite_only" checked={settings.invite_only === 'true'} onChange={e => update('invite_only', String(e.target.checked))} />
                <label htmlFor="invite_only" className="text-sm">邀请制注册</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="maintenance" checked={settings.maintenance_mode === 'true'} onChange={e => update('maintenance_mode', String(e.target.checked))} />
                <label htmlFor="maintenance" className="text-sm">维护模式</label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">外观设置</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Logo URL</label>
                <input type="text" value={settings.logo_url || ''} onChange={e => update('logo_url', e.target.value)} className="input" placeholder="/static/logo.png" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Favicon URL</label>
                <input type="text" value={settings.favicon_url || ''} onChange={e => update('favicon_url', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>主题色</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.theme_primary_color || '#5E50CE'} onChange={e => update('theme_primary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <input type="text" value={settings.theme_primary_color || '#5E50CE'} onChange={e => update('theme_primary_color', e.target.value)} className="input flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>副题色</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.theme_secondary_color || '#e6e4f7'} onChange={e => update('theme_secondary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <input type="text" value={settings.theme_secondary_color || '#e6e4f7'} onChange={e => update('theme_secondary_color', e.target.value)} className="input flex-1" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">内容设置</h2>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="auto_approve" checked={settings.auto_approve !== 'false'} onChange={e => update('auto_approve', String(e.target.checked))} />
                <label htmlFor="auto_approve" className="text-sm">帖子自动审核通过</label>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>每页帖子数</label>
                <input type="number" value={settings.posts_per_page || '20'} onChange={e => update('posts_per_page', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>帖子回收站保留天数</label>
                <input type="number" value={settings.trash_days || '30'} onChange={e => update('trash_days', e.target.value)} className="input" />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">安全设置</h2>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="require_email_verify" checked={settings.require_email_verify === 'true'} onChange={e => update('require_email_verify', String(e.target.checked))} />
                <label htmlFor="require_email_verify" className="text-sm">注册需要邮箱验证</label>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>登录失败锁定次数</label>
                <input type="number" value={settings.max_login_attempts || '5'} onChange={e => update('max_login_attempts', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>IP白名单 (超管登录, 逗号分隔)</label>
                <input type="text" value={settings.admin_ip_whitelist || ''} onChange={e => update('admin_ip_whitelist', e.target.value)} className="input" placeholder="留空不限制" />
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">自定义代码</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Header HTML (插入到 &lt;head&gt;)</label>
                <textarea value={settings.header_html || ''} onChange={e => update('header_html', e.target.value)} className="input min-h-[150px] font-mono text-sm" placeholder="自定义CSS、JS等" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Footer HTML</label>
                <textarea value={settings.footer_html || ''} onChange={e => update('footer_html', e.target.value)} className="input min-h-[150px] font-mono text-sm" placeholder="页脚自定义内容" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
