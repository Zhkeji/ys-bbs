'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DisputeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [dispute, setDispute] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [createForm, setCreateForm] = useState({ type: 'REFUND', reason: '', description: '' })
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    // Try to load existing dispute
    fetch(`/api/admin/customer-service/disputes/${params.id}`).then(r => r.json()).then(d => {
      if (d.code === 0) setDispute(d.data)
      else setShowCreate(true) // No dispute yet, show create form
    }).catch(() => setShowCreate(true)).finally(() => setLoading(false))
  }, [params.id])

  const handleCreateDispute = async () => {
    if (!createForm.reason) { alert('请填写争议原因'); return }
    const res = await fetch('/api/admin/customer-service/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: params.id, ...createForm }),
    })
    const d = await res.json()
    if (d.code === 0) {
      alert('争议已提交，客服会尽快处理')
      router.push('/dispute')
    } else {
      alert(d.message)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !dispute) return
    // Send message through dispute messages API
    const res = await fetch(`/api/admin/customer-service/disputes/${dispute.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', data: { content: message } }),
    })
    const d = await res.json()
    if (d.code === 0) {
      setMessage('')
      // Reload dispute
      const refreshed = await fetch(`/api/admin/customer-service/disputes/${dispute.id}`).then(r => r.json())
      if (refreshed.code === 0) setDispute(refreshed.data)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
  }

  const disputeTypeLabels: Record<string, string> = {
    REFUND: '仅退款', RETURN_REFUND: '退货退款', QUALITY: '商品质量',
    FRAUD: '欺诈', NOT_RECEIVED: '未收到货', WRONG_ITEM: '货不对板', OTHER: '其他',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-gavel mr-2" style={{ color: 'var(--primary)' }}></i>{showCreate ? '发起争议' : '争议详情'}</h1>

      {showCreate ? (
        <div className="card p-6">
          <h2 className="font-bold mb-4">发起争议</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>争议类型</label>
              <select value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })} className="input">
                <option value="REFUND">仅退款</option>
                <option value="RETURN_REFUND">退货退款</option>
                <option value="QUALITY">商品质量</option>
                <option value="NOT_RECEIVED">未收到货</option>
                <option value="WRONG_ITEM">货不对板</option>
                <option value="FRAUD">欺诈</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>争议原因</label>
              <input type="text" value={createForm.reason} onChange={e => setCreateForm({ ...createForm, reason: e.target.value })} className="input" placeholder="简要描述问题" />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>详细描述</label>
              <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="input min-h-[120px]" placeholder="请详细描述您遇到的问题，附上相关证据..." />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => router.back()} className="btn btn-secondary">取消</button>
              <button onClick={handleCreateDispute} className="btn btn-primary"><i className="fas fa-paper-plane mr-1"></i>提交争议</button>
            </div>
          </div>
        </div>
      ) : dispute && (
        <>
          <div className="card p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold">{dispute.reason}</h2>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{dispute.disputeNo}</span>
              </div>
              <span className={`badge ${dispute.status === 'RESOLVED' ? 'badge-success' : dispute.status === 'CLOSED' ? 'badge-primary' : 'badge-warning'}`}>
                {dispute.status === 'OPEN' ? '待处理' : dispute.status === 'RESOLVED' ? '已解决' : dispute.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span style={{ color: 'var(--text-muted)' }}>类型:</span> {disputeTypeLabels[dispute.type]}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>订单金额:</span> ¥{dispute.order?.totalAmount}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>买家:</span> {dispute.buyer?.nickname}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>卖家:</span> {dispute.seller?.nickname}</div>
            </div>
            {dispute.description && (
              <div className="p-3 rounded text-sm" style={{ background: 'var(--bg)' }}>
                <p>{dispute.description}</p>
              </div>
            )}
            {dispute.result && (
              <div className="mt-3 p-3 rounded text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--success)' }}>处理结果:</p>
                <p>{dispute.result}</p>
                {dispute.resultAmount > 0 && <p className="font-bold mt-1">退款: ¥{dispute.resultAmount}</p>}
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="font-bold mb-4">对话记录</h3>
            <div className="flex flex-col gap-3 mb-4 max-h-[400px] overflow-auto">
              {dispute.messages?.map((msg: any) => (
                <div key={msg.id}>
                  {msg.type === 'SYSTEM' || msg.type === 'RESULT' ? (
                    <div className="text-center text-xs py-2" style={{ color: 'var(--text-muted)' }}>{msg.content}</div>
                  ) : (
                    <div className="flex gap-2">
                      <img src={msg.sender?.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{msg.sender?.nickname}</span>
                          {msg.type === 'CS_REPLY' && <span className="badge role-admin text-xs">客服</span>}
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString('zh-CN')}</span>
                        </div>
                        <div className="p-2 rounded text-sm" style={{ background: 'var(--bg)' }}>{msg.content}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
              <div className="flex gap-2">
                <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="input flex-1" placeholder="输入消息..." />
                <button onClick={handleSendMessage} className="btn btn-primary" disabled={!message.trim()}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
