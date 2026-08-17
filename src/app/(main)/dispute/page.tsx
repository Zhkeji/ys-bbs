'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DisputePage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shop/orders?type=buy&status=DISPUTE').then(r => r.json()).then(d => {
      if (d.code === 0) setDisputes(d.data.items)
    }).finally(() => setLoading(false))
  }, [])

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
    PENDING_EVIDENCE: 'badge-warning', RESOLVED: 'badge-success', CLOSED: 'badge-primary',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"><i className="fas fa-gavel mr-2" style={{ color: 'var(--primary)' }}></i>我的争议</h1>
        <Link href="/shop" className="btn btn-secondary btn-sm"><i className="fas fa-arrow-left mr-1"></i>返回商城</Link>
      </div>

      {loading ? (
        <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i></div>
      ) : disputes.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-check-circle text-4xl mb-4" style={{ color: 'var(--success)' }}></i>
          <p className="font-medium mb-2">没有进行中的争议</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>如需发起争议，请在订单详情中操作</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {disputes.map((order: any) => (
            <div key={order.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>订单号: {order.orderNo}</span>
                  <span className="ml-3 font-bold" style={{ color: 'var(--accent)' }}>¥{order.totalAmount}</span>
                </div>
                <span className={`badge ${disputeStatusColors[order.status] || 'badge-primary'}`}>
                  {order.status === 'DISPUTE' ? '争议中' : order.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {order.product?.images?.[0] && (
                  <img src={order.product.images[0]} className="w-16 h-16 rounded-lg object-cover" alt="" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{order.product?.title}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>x{order.quantity}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  卖家: {order.seller?.nickname || order.seller?.username}
                </span>
                <div className="flex gap-2">
                  <Link href={`/dispute/${order.id}`} className="btn btn-primary btn-sm">
                    <i className="fas fa-eye mr-1"></i>查看详情
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const msg = prompt('请输入您要联系客服的问题:')
                    if (msg) {
                      fetch('/api/admin/customer-service/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject: `订单${order.orderNo}问题: ${msg}` }),
                      }).then(r => r.json()).then(d => {
                        if (d.code === 0) alert('已为您转接客服，请等待...')
                      })
                    }
                  }}>
                    <i className="fas fa-headset mr-1"></i>联系客服
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
