'use client'

import { useState, useEffect, useRef } from 'react'

export default function CustomerServicePage() {
  const [stats, setStats] = useState<any>({})
  const [disputes, setDisputes] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'disputes' | 'chat' | 'quick-replies'>('overview')
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [disputeReply, setDisputeReply] = useState('')
  const [resolveForm, setResolveForm] = useState({ result: '', resultAmount: 0 })
  const [disputeStatusFilter, setDisputeStatusFilter] = useState('')
  const [sessionStatusFilter, setSessionStatusFilter] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStats()
    fetchDisputes()
    fetchSessions()
  }, [])

  const fetchStats = () => {
    fetch('/api/admin/customer-service/stats').then(r => r.json()).then(d => {
      if (d.code === 0) setStats(d.data)
    })
  }

  const fetchDisputes = () => {
    const params = new URLSearchParams({ pageSize: '50' })
    if (disputeStatusFilter) params.set('status', disputeStatusFilter)
    fetch(`/api/admin/customer-service/disputes?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) setDisputes(d.data.items)
    })
  }

  const fetchSessions = () => {
    const params = new URLSearchParams()
    if (sessionStatusFilter) params.set('status', sessionStatusFilter)
    fetch(`/api/admin/customer-service/chat?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) setSessions(d.data)
    })
  }

  const loadDispute = async (id: string) => {
    const res = await fetch(`/api/admin/customer-service/disputes/${id}`)
    const d = await res.json()
    if (d.code === 0) setSelectedDispute(d.data)
  }

  const loadSession = async (sessionId: string) => {
    const res = await fetch(`/api/admin/customer-service/chat/${sessionId}`)
    const d = await res.json()
    if (d.code === 0) {
      setSelectedSession(d.data)
      setChatMessages(d.data.messages || [])
    }
  }

  const handleDisputeAction = async (action: string, data?: any) => {
    if (!selectedDispute) return
    const res = await fetch(`/api/admin/customer-service/disputes/${selectedDispute.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    })
    const d = await res.json()
    if (d.code === 0) {
      loadDispute(selectedDispute.id)
      fetchDisputes()
      fetchStats()
      if (action === 'reply') setDisputeReply('')
    } else {
      alert(d.message)
    }
  }

  const handleChatAction = async (action: string, data?: any) => {
    if (!selectedSession) return
    const res = await fetch(`/api/admin/customer-service/chat/${selectedSession.sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    })
    const d = await res.json()
    if (d.code === 0) {
      if (action === 'send') {
        setChatInput('')
        loadSession(selectedSession.sessionId)
      } else {
        loadSession(selectedSession.sessionId)
        fetchSessions()
      }
    } else {
      alert(d.message)
    }
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return
    handleChatAction('send', { content: chatInput })
  }

  const disputeTypeLabels: Record<string, string> = {
    REFUND: '仅退款', RETURN_REFUND: '退货退款', QUALITY: '商品质量',
    FRAUD: '欺诈', NOT_RECEIVED: '未收到货', WRONG_ITEM: '货不对板', OTHER: '其他',
  }
  const disputeStatusLabels: Record<string, string> = {
    OPEN: '待处理', NEGOTIATING: '协商中', CS_INTERVENTION: '客服介入',
    PENDING_EVIDENCE: '等待举证', PENDING_REVIEW: '等待审核',
    RESOLVED: '已解决', CLOSED: '已关闭', ESCALATED: '已升级',
  }
  const disputeStatusColors: Record<string, string> = {
    OPEN: 'badge-warning', NEGOTIATING: 'badge-primary', CS_INTERVENTION: 'badge-error',
    PENDING_EVIDENCE: 'badge-warning', PENDING_REVIEW: 'badge-primary',
    RESOLVED: 'badge-success', CLOSED: 'badge-primary', ESCALATED: 'badge-error',
  }
  const priorityColors: Record<string, string> = {
    LOW: '#22c55e', NORMAL: '#4a90e2', HIGH: '#f59e0b', URGENT: '#ef4444',
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* 标签页 */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold mr-4"><i className="fas fa-headset mr-2" style={{ color: 'var(--primary)' }}></i>客服工作台</h1>
        {[
          { key: 'overview', label: '总览', icon: 'fa-chart-pie' },
          { key: 'disputes', label: '争议工单', icon: 'fa-gavel', badge: stats.disputes?.open },
          { key: 'chat', label: '在线客服', icon: 'fa-comments', badge: stats.sessions?.waiting },
          { key: 'quick-replies', label: '快捷回复', icon: 'fa-bolt' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}>
            <i className={`fas ${tab.icon} mr-1`}></i>{tab.label}
            {tab.badge > 0 && <span className="badge badge-error ml-1">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* 总览 */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: 'fa-gavel', label: '待处理争议', value: stats.disputes?.open || 0, color: '#ef4444' },
              { icon: 'fa-check-circle', label: '已解决争议', value: stats.disputes?.resolved || 0, color: '#22c55e' },
              { icon: 'fa-comments', label: '进行中会话', value: stats.sessions?.active || 0, color: '#4a90e2' },
              { icon: 'fa-clock', label: '排队等待', value: stats.sessions?.waiting || 0, color: '#f59e0b' },
              { icon: 'fa-calendar-day', label: '今日争议', value: stats.disputes?.today || 0, color: '#8b5cf6' },
              { icon: 'fa-calendar-day', label: '今日会话', value: stats.sessions?.today || 0, color: '#06b6d4' },
              { icon: 'fa-star', label: '平均评分', value: stats.avgRating || '0', color: '#FFD700' },
              { icon: 'fa-headset', label: '在线客服', value: stats.agents?.filter((a: any) => a.isOnline).length || 0, color: '#FF6B35' },
            ].map((card, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${card.color}20` }}>
                    <i className={`fas ${card.icon}`} style={{ color: card.color }}></i>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                    <p className="text-lg font-bold">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 客服排行 */}
          <div className="card p-4">
            <h2 className="font-bold mb-4"><i className="fas fa-trophy mr-2" style={{ color: '#FFD700' }}></i>客服排行榜</h2>
            <table className="table">
              <thead><tr><th>客服</th><th>状态</th><th>处理数</th><th>当前会话</th><th>平均评分</th></tr></thead>
              <tbody>
                {stats.agents?.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>暂无数据</td></tr>
                ) : stats.agents?.map((agent: any) => (
                  <tr key={agent.id}>
                    <td className="flex items-center gap-2">
                      <img src={agent.user?.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                      <span>{agent.user?.nickname || agent.user?.username}</span>
                    </td>
                    <td>{agent.isOnline ? <span className="badge badge-success">在线</span> : <span className="badge badge-primary">离线</span>}</td>
                    <td>{agent.totalHandled}</td>
                    <td>{agent.currentSessions}/{agent.maxSessions}</td>
                    <td><span style={{ color: '#FFD700' }}>★</span> {agent.avgRating?.toFixed(1) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 争议工单 */}
      {activeTab === 'disputes' && (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* 左侧列表 */}
          <div className="w-80 flex-shrink-0 flex flex-col">
            <div className="flex gap-2 mb-3 flex-wrap">
              {['', 'OPEN', 'CS_INTERVENTION', 'PENDING_EVIDENCE', 'RESOLVED', 'CLOSED'].map(s => (
                <button key={s} onClick={() => { setDisputeStatusFilter(s); setTimeout(fetchDisputes, 100) }}
                  className={`btn btn-xs ${disputeStatusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
                  {s ? disputeStatusLabels[s] : '全部'}
                </button>
              ))}
            </div>
            <div className="card flex-1 overflow-auto">
              {disputes.map(d => (
                <div key={d.id} onClick={() => loadDispute(d.id)}
                  className={`p-3 cursor-pointer hover:bg-[var(--bg-hover)] ${selectedDispute?.id === d.id ? 'bg-[var(--bg-hover)]' : ''}`}
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{d.disputeNo}</span>
                    <span className="badge badge-xs" style={{ background: priorityColors[d.priority] + '20', color: priorityColors[d.priority] }}>
                      {d.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{d.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge badge-xs ${disputeStatusColors[d.status]}`}>{disputeStatusLabels[d.status]}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{disputeTypeLabels[d.type]}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>¥{d.order?.totalAmount}</span>
                  </div>
                </div>
              ))}
              {disputes.length === 0 && <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>暂无争议</div>}
            </div>
          </div>

          {/* 右侧详情 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedDispute ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-gavel text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
                  <p style={{ color: 'var(--text-muted)' }}>选择一个争议工单查看详情</p>
                </div>
              </div>
            ) : (
              <>
                {/* 争议信息 */}
                <div className="card p-4 mb-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-bold">{selectedDispute.reason}</h2>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{selectedDispute.disputeNo}</span>
                    </div>
                    <div className="flex gap-2">
                      {selectedDispute.status === 'OPEN' && (
                        <button onClick={() => handleDisputeAction('accept')} className="btn btn-primary btn-sm">
                          <i className="fas fa-hand-paper mr-1"></i>接单处理
                        </button>
                      )}
                      {selectedDispute.status === 'CS_INTERVENTION' && (
                        <>
                          <button onClick={() => handleDisputeAction('request_evidence')} className="btn btn-secondary btn-sm">
                            <i className="fas fa-file-alt mr-1"></i>要求举证
                          </button>
                          <button onClick={() => { setResolveForm({ result: '', resultAmount: 0 }); }} className="btn btn-primary btn-sm"
                            data-bs-toggle="modal">
                            <i className="fas fa-check mr-1"></i>处理争议
                          </button>
                        </>
                      )}
                      {selectedDispute.status !== 'RESOLVED' && selectedDispute.status !== 'CLOSED' && (
                        <button onClick={() => handleDisputeAction('set_priority', { priority: selectedDispute.priority === 'URGENT' ? 'HIGH' : 'URGENT' })}
                          className="btn btn-secondary btn-sm">
                          <i className="fas fa-exclamation-triangle mr-1"></i>{selectedDispute.priority === 'URGENT' ? '降级' : '升级'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span style={{ color: 'var(--text-muted)' }}>类型:</span> {disputeTypeLabels[selectedDispute.type]}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>状态:</span> <span className={`badge ${disputeStatusColors[selectedDispute.status]}`}>{disputeStatusLabels[selectedDispute.status]}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>订单金额:</span> ¥{selectedDispute.order?.totalAmount}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>处理人:</span> {selectedDispute.handler?.nickname || '未分配'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="p-3 rounded" style={{ background: 'var(--bg)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>买家</span>
                      <p className="text-sm font-medium">{selectedDispute.buyer?.nickname || selectedDispute.buyer?.username}</p>
                    </div>
                    <div className="p-3 rounded" style={{ background: 'var(--bg)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>卖家</span>
                      <p className="text-sm font-medium">{selectedDispute.seller?.nickname || selectedDispute.seller?.username}</p>
                    </div>
                  </div>

                  {selectedDispute.description && (
                    <div className="mt-3 p-3 rounded text-sm" style={{ background: 'var(--bg)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>详细描述:</span>
                      <p className="mt-1">{selectedDispute.description}</p>
                    </div>
                  )}
                </div>

                {/* 对话记录 */}
                <div className="card flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-auto p-4">
                    {selectedDispute.messages?.map((msg: any) => (
                      <div key={msg.id} className={`mb-3 ${msg.type === 'SYSTEM' || msg.type === 'RESULT' ? 'text-center' : ''}`}>
                        {msg.type === 'SYSTEM' || msg.type === 'RESULT' ? (
                          <div className="text-xs py-2 px-4 rounded-lg inline-block" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                            {msg.content}
                          </div>
                        ) : (
                          <div className={`flex gap-2 ${msg.type === 'CS_REPLY' ? 'justify-center' : ''}`}>
                            <img src={msg.sender?.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                            <div className="flex-1 max-w-[80%]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{msg.sender?.nickname || msg.sender?.username}</span>
                                {msg.type === 'CS_REPLY' && <span className="badge role-admin">客服</span>}
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString('zh-CN')}</span>
                              </div>
                              <div className="p-3 rounded-lg text-sm" style={{ background: msg.type === 'CS_REPLY' ? 'rgba(94,80,206,0.1)' : 'var(--bg)' }}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* 回复框 */}
                  {selectedDispute.status !== 'RESOLVED' && selectedDispute.status !== 'CLOSED' && (
                    <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex gap-2">
                        <textarea value={disputeReply} onChange={e => setDisputeReply(e.target.value)} className="input flex-1" rows={2} placeholder="输入回复..." />
                        <button onClick={() => handleDisputeAction('reply', { content: disputeReply })} className="btn btn-primary" disabled={!disputeReply.trim()}>
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 处理争议弹窗 */}
                {selectedDispute.status === 'CS_INTERVENTION' && (
                  <div className="mt-4 card p-4 flex-shrink-0">
                    <h3 className="font-bold mb-3"><i className="fas fa-gavel mr-2" style={{ color: 'var(--primary)' }}></i>处理争议</h3>
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>处理结果</label>
                        <textarea value={resolveForm.result} onChange={e => setResolveForm({ ...resolveForm, result: e.target.value })} className="input" placeholder="填写处理结果..." />
                      </div>
                      <div>
                        <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>退款金额 (元)</label>
                        <input type="number" value={resolveForm.resultAmount} onChange={e => setResolveForm({ ...resolveForm, resultAmount: parseFloat(e.target.value) || 0 })} className="input" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleDisputeAction('close', { reason: '争议已关闭' })} className="btn btn-secondary">关闭争议</button>
                        <button onClick={() => handleDisputeAction('resolve', resolveForm)} className="btn btn-primary">
                          <i className="fas fa-check mr-1"></i>确认处理
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 在线客服 */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* 会话列表 */}
          <div className="w-72 flex-shrink-0 flex flex-col">
            <div className="flex gap-2 mb-3">
              {['', 'WAITING', 'ACTIVE', 'CLOSED'].map(s => (
                <button key={s} onClick={() => { setSessionStatusFilter(s); setTimeout(fetchSessions, 100) }}
                  className={`btn btn-xs ${sessionStatusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
                  {s === 'WAITING' ? '排队' : s === 'ACTIVE' ? '进行中' : s === 'CLOSED' ? '已结束' : '全部'}
                </button>
              ))}
            </div>
            <div className="card flex-1 overflow-auto">
              {sessions.map((s: any) => (
                <div key={s.id} onClick={() => loadSession(s.sessionId)}
                  className={`p-3 cursor-pointer hover:bg-[var(--bg-hover)] ${selectedSession?.id === s.id ? 'bg-[var(--bg-hover)]' : ''}`}
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <img src={s.user?.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.user?.nickname || s.user?.username}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{s.messages?.[0]?.content || s.subject || '新会话'}</p>
                    </div>
                    {s.status === 'WAITING' && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }}></div>}
                    {s.status === 'ACTIVE' && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }}></div>}
                  </div>
                </div>
              ))}
              {sessions.length === 0 && <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>暂无会话</div>}
            </div>
          </div>

          {/* 聊天区 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedSession ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-comments text-4xl mb-4" style={{ color: 'var(--text-muted)' }}></i>
                  <p style={{ color: 'var(--text-muted)' }}>选择一个会话开始服务</p>
                </div>
              </div>
            ) : (
              <>
                {/* 会话信息栏 */}
                <div className="card p-3 mb-4 flex-shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={selectedSession.user?.avatar || '/static/default-avatar.png'} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <p className="font-medium">{selectedSession.user?.nickname || selectedSession.user?.username}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedSession.subject || '在线咨询'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedSession.status === 'WAITING' && (
                      <button onClick={() => handleChatAction('accept')} className="btn btn-primary btn-sm">
                        <i className="fas fa-phone mr-1"></i>接单
                      </button>
                    )}
                    {selectedSession.status === 'ACTIVE' && (
                      <button onClick={() => handleChatAction('close')} className="btn btn-danger btn-sm">
                        <i className="fas fa-times mr-1"></i>结束会话
                      </button>
                    )}
                  </div>
                </div>

                {/* 消息列表 */}
                <div className="card flex-1 overflow-auto p-4 mb-4">
                  {chatMessages.map((msg: any) => (
                    <div key={msg.id} className={`mb-3 ${msg.type === 'system' || msg.type === 'transfer' ? 'text-center' : ''}`}>
                      {msg.type === 'system' || msg.type === 'transfer' ? (
                        <div className="text-xs py-2 px-4 rounded-lg inline-block" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                          {msg.content}
                        </div>
                      ) : (
                        <div className={`flex gap-2 ${msg.senderId === selectedSession.agentId ? '' : 'flex-row-reverse'}`}>
                          <img src={msg.sender?.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                          <div className="max-w-[70%]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{msg.sender?.nickname || msg.sender?.username}</span>
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString('zh-CN')}</span>
                            </div>
                            <div className="p-3 rounded-lg text-sm" style={{ background: msg.senderId === selectedSession.agentId ? 'rgba(94,80,206,0.1)' : 'var(--bg)' }}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* 输入框 */}
                {selectedSession.status === 'ACTIVE' && (
                  <div className="card p-3 flex-shrink-0">
                    <div className="flex gap-2">
                      <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage() } }}
                        className="input flex-1" rows={2} placeholder="输入消息..." />
                      <button onClick={sendChatMessage} className="btn btn-primary" disabled={!chatInput.trim()}>
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 快捷回复 */}
      {activeTab === 'quick-replies' && (
        <div className="flex-1 overflow-auto">
          <div className="card p-6">
            <h2 className="font-bold mb-4"><i className="fas fa-bolt mr-2" style={{ color: 'var(--primary)' }}></i>快捷回复模板</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: '欢迎语', content: '您好，欢迎联系YS平台客服，请问有什么可以帮助您的？', category: '开场' },
                { title: '等待中', content: '正在为您查询中，请稍等片刻...', category: '通用' },
                { title: '退款说明', content: '关于退款，我们会在1-3个工作日内处理完成，退款将原路返回到您的支付账户。', category: '退款' },
                { title: '举证要求', content: '请提供以下证据：1. 商品实物照片 2. 订单截图 3. 与卖家的聊天记录', category: '争议' },
                { title: '处理完成', content: '您的问题已经处理完成，如有其他问题请随时联系我们。祝您生活愉快！', category: '结束' },
                { title: '转接说明', content: '您的问题需要专业客服处理，正在为您转接中，请稍等...', category: '转接' },
              ].map((reply, i) => (
                <div key={i} className="card p-4 hover:border-[var(--primary)] cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{reply.title}</span>
                    <span className="badge badge-primary">{reply.category}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{reply.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
