'use client'

import { useState, useEffect } from 'react'

export default function SuperSiteConfigPage() {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    fetch('/api/super/site').then(r => r.json()).then(d => {
      if (d.code === 0) setSettings(d.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const flatSettings: any = {}
    Object.values(settings).forEach((group: any) => {
      if (Array.isArray(group)) {
        group.forEach((s: any) => { flatSettings[s.key] = s.value })
      }
    })
    const res = await fetch('/api/super/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flatSettings),
    })
    const d = await res.json()
    if (d.code === 0) alert('站点配置已更新')
    else alert(d.message)
    setSaving(false)
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev: any) => {
      const next = { ...prev }
      for (const group of Object.keys(next)) {
        if (Array.isArray(next[group])) {
          const idx = next[group].findIndex((s: any) => s.key === key)
          if (idx !== -1) {
            next[group] = [...next[group]]
            next[group][idx] = { ...next[group][idx], value }
            break
          }
        }
      }
      return next
    })
  }

  const getSetting = (key: string) => {
    for (const group of Object.values(settings)) {
      if (Array.isArray(group)) {
        const found = group.find((s: any) => s.key === key)
        if (found) return found.value
      }
    }
    return ''
  }

  const tabs = [
    { key: 'basic', label: '基本信息', icon: 'fa-info-circle' },
    { key: 'brand', label: '品牌标识', icon: 'fa-image' },
    { key: 'theme', label: '主题配色', icon: 'fa-palette' },
    { key: 'welcome', label: '欢迎信息', icon: 'fa-hand-sparkles' },
    { key: 'registration', label: '注册设置', icon: 'fa-user-plus' },
    { key: 'custom', label: '自定义代码', icon: 'fa-code' },
    { key: 'links', label: '链接管理', icon: 'fa-link' },
  ]

  if (loading) return <div className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"><i className="fas fa-globe mr-2" style={{ color: '#FFD700' }}></i>站点配置</h1>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save mr-1"></i>保存配置</>}
        </button>
      </div>

      <div className="flex gap-6">
        <aside className="w-48 flex-shrink-0">
          <div className="card p-2 sticky top-20">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${activeTab === tab.key ? 'text-black' : 'hover:bg-[rgba(255,215,0,0.1)]'}`}
                style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #FFD700, #FFA500)' } : {}}>
                <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'basic' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">基本信息</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>站点名称</label>
                <input type="text" value={getSetting('site_name')} onChange={e => updateSetting('site_name', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>站点描述</label>
                <textarea value={getSetting('site_description')} onChange={e => updateSetting('site_description', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>站点URL</label>
                <input type="text" value={getSetting('site_url')} onChange={e => updateSetting('site_url', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>ICP备案号</label>
                <input type="text" value={getSetting('icp_number')} onChange={e => updateSetting('icp_number', e.target.value)} className="input" placeholder="京ICP备XXXXXXXX号" />
              </div>
            </div>
          )}

          {activeTab === 'brand' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">品牌标识</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Logo URL</label>
                <input type="text" value={getSetting('logo_url')} onChange={e => updateSetting('logo_url', e.target.value)} className="input" />
                {getSetting('logo_url') && <img src={getSetting('logo_url')} className="mt-2 h-10" alt="Logo预览" />}
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Favicon URL</label>
                <input type="text" value={getSetting('favicon_url')} onChange={e => updateSetting('favicon_url', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Logo文字</label>
                <input type="text" value={getSetting('logo_text')} onChange={e => updateSetting('logo_text', e.target.value)} className="input" placeholder="YS" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Logo副标题</label>
                <input type="text" value={getSetting('logo_subtitle')} onChange={e => updateSetting('logo_subtitle', e.target.value)} className="input" placeholder="系统圈论坛" />
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">主题配色</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>主题色</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={getSetting('theme_primary_color') || '#5E50CE'} onChange={e => updateSetting('theme_primary_color', e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                  <input type="text" value={getSetting('theme_primary_color')} onChange={e => updateSetting('theme_primary_color', e.target.value)} className="input flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>副题色</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={getSetting('theme_secondary_color') || '#e6e4f7'} onChange={e => updateSetting('theme_secondary_color', e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                  <input type="text" value={getSetting('theme_secondary_color')} onChange={e => updateSetting('theme_secondary_color', e.target.value)} className="input flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>背景色</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={getSetting('theme_bg_color') || '#0f0f14'} onChange={e => updateSetting('theme_bg_color', e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                  <input type="text" value={getSetting('theme_bg_color')} onChange={e => updateSetting('theme_bg_color', e.target.value)} className="input flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>文字色</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={getSetting('theme_text_color') || '#e4e4e7'} onChange={e => updateSetting('theme_text_color', e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                  <input type="text" value={getSetting('theme_text_color')} onChange={e => updateSetting('theme_text_color', e.target.value)} className="input flex-1" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'welcome' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">欢迎信息</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>欢迎标题</label>
                <input type="text" value={getSetting('welcome_title')} onChange={e => updateSetting('welcome_title', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>欢迎消息 (支持HTML)</label>
                <textarea value={getSetting('welcome_message')} onChange={e => updateSetting('welcome_message', e.target.value)} className="input min-h-[150px]" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>QQ交流群</label>
                <input type="text" value={getSetting('qq_group')} onChange={e => updateSetting('qq_group', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>腾讯频道链接</label>
                <input type="text" value={getSetting('tencent_channel')} onChange={e => updateSetting('tencent_channel', e.target.value)} className="input" />
              </div>
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">注册设置</h2>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="reg_enabled" checked={getSetting('registration_enabled') !== 'false'} onChange={e => updateSetting('registration_enabled', String(e.target.checked))} />
                <label htmlFor="reg_enabled" className="text-sm">开放注册</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="invite_only" checked={getSetting('invite_only') === 'true'} onChange={e => updateSetting('invite_only', String(e.target.checked))} />
                <label htmlFor="invite_only" className="text-sm">邀请制注册</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="email_verify" checked={getSetting('require_email_verify') === 'true'} onChange={e => updateSetting('require_email_verify', String(e.target.checked))} />
                <label htmlFor="email_verify" className="text-sm">需要邮箱验证</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="maintenance" checked={getSetting('maintenance_mode') === 'true'} onChange={e => updateSetting('maintenance_mode', String(e.target.checked))} />
                <label htmlFor="maintenance" className="text-sm">维护模式</label>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>维护模式提示</label>
                <textarea value={getSetting('maintenance_message')} onChange={e => updateSetting('maintenance_message', e.target.value)} className="input" />
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">自定义代码</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>&lt;head&gt; 自定义HTML</label>
                <textarea value={getSetting('header_html')} onChange={e => updateSetting('header_html', e.target.value)} className="input min-h-[150px] font-mono text-xs" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>页脚 HTML</label>
                <textarea value={getSetting('footer_html')} onChange={e => updateSetting('footer_html', e.target.value)} className="input min-h-[150px] font-mono text-xs" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>自定义CSS</label>
                <textarea value={getSetting('custom_css')} onChange={e => updateSetting('custom_css', e.target.value)} className="input min-h-[150px] font-mono text-xs" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>自定义JS</label>
                <textarea value={getSetting('custom_js')} onChange={e => updateSetting('custom_js', e.target.value)} className="input min-h-[150px] font-mono text-xs" />
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-bold mb-2">链接管理</h2>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>友情链接 (JSON格式)</label>
                <textarea value={getSetting('friend_links')} onChange={e => updateSetting('friend_links', e.target.value)} className="input min-h-[200px] font-mono text-xs"
                  placeholder={`[{"name":"Bing搜索","url":"https://bing.com/","icon":"fa-search"}]`} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>社区公约页面URL</label>
                <input type="text" value={getSetting('rules_url')} onChange={e => updateSetting('rules_url', e.target.value)} className="input" placeholder="/p/rules" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>隐私政策页面URL</label>
                <input type="text" value={getSetting('privacy_url')} onChange={e => updateSetting('privacy_url', e.target.value)} className="input" placeholder="/p/privacy" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
