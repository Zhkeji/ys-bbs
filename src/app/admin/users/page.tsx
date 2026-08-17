'use client'

import { useState, useEffect } from 'react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [actionModal, setActionModal] = useState<string | null>(null)
  const [actionData, setActionData] = useState<any>({})

  const fetchUsers = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (search) params.set('q', search)
    if (roleFilter) params.set('role', roleFilter)

    fetch(`/api/admin/users?${params}`).then(r => r.json()).then(d => {
      if (d.code === 0) { setUsers(d.data.items); setTotalPages(d.data.totalPages) }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const handleAction = async (userId: string, action: string, data?: any) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, data }),
    })
    const d = await res.json()
    if (d.code === 0) {
      fetchUsers()
      setActionModal(null)
      setSelectedUser(null)
    } else {
      alert(d.message)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6"><i className="fas fa-users mr-2" style={{ color: 'var(--primary)' }}></i>用户管理</h1>

      {/* 筛选 */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} className="input pl-10" placeholder="搜索用户名/邮箱..." />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}></i>
            </div>
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="input w-auto">
            <option value="">全部角色</option>
            <option value="USER">普通用户</option>
            <option value="MODERATOR">版主</option>
            <option value="CUSTOMER_SERVICE">客服</option>
            <option value="ADMIN">管理员</option>
            <option value="SUPERADMIN">超级管理员</option>
          </select>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>用户</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>头衔</th>
                <th>积分/等级</th>
                <th>帖子/评论</th>
                <th>状态</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8"><i className="fas fa-spinner fa-spin"></i></td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <img src={u.avatar || '/static/default-avatar.png'} className="w-8 h-8 rounded-full" alt="" />
                      <span>{u.nickname || u.username}</span>
                    </div>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <span className={`badge role-${u.role.toLowerCase()}`}>
                      {u.role === 'SUPERADMIN' ? '超管' : u.role === 'ADMIN' ? '管理' : u.role === 'MODERATOR' ? '版主' : u.role === 'CUSTOMER_SERVICE' ? '客服' : '用户'}
                    </span>
                  </td>
                  <td className="text-sm">{u.title || '—'}</td>
                  <td className="text-sm">{u.points} / Lv.{u.level}</td>
                  <td className="text-sm">{u.postCount} / {u.commentCount}</td>
                  <td>
                    {u.isBanned ? <span className="badge badge-error">封禁</span> :
                     u.isMuted ? <span className="badge badge-warning">禁言</span> :
                     <span className="badge badge-success">正常</span>}
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setSelectedUser(u); setActionModal('setTitle') }} className="btn btn-secondary btn-sm" title="设置头衔">
                        <i className="fas fa-tag"></i>
                      </button>
                      <button onClick={() => { setSelectedUser(u); setActionModal('setRole') }} className="btn btn-secondary btn-sm" title="设置角色">
                        <i className="fas fa-user-shield"></i>
                      </button>
                      {!u.isBanned ? (
                        <button onClick={() => { setSelectedUser(u); setActionModal('ban') }} className="btn btn-danger btn-sm" title="封禁">
                          <i className="fas fa-ban"></i>
                        </button>
                      ) : (
                        <button onClick={() => handleAction(u.id, 'unban')} className="btn btn-secondary btn-sm" title="解封">
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      {!u.isMuted ? (
                        <button onClick={() => { setSelectedUser(u); setActionModal('mute') }} className="btn btn-secondary btn-sm" title="禁言">
                          <i className="fas fa-volume-mute"></i>
                        </button>
                      ) : (
                        <button onClick={() => handleAction(u.id, 'unmute')} className="btn btn-secondary btn-sm" title="解除禁言">
                          <i className="fas fa-volume-up"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="pagination justify-center mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><i className="fas fa-chevron-left"></i></button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''}>{p}</button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><i className="fas fa-chevron-right"></i></button>
        </div>
      )}

      {/* 操作弹窗 */}
      {actionModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">
              {actionModal === 'setTitle' && '设置头衔'}
              {actionModal === 'setRole' && '设置角色'}
              {actionModal === 'ban' && '封禁用户'}
              {actionModal === 'mute' && '禁言用户'}
            </h3>

            {actionModal === 'setTitle' && (
              <div>
                <input type="text" value={actionData.title || ''} onChange={e => setActionData({ title: e.target.value })} className="input mb-4" placeholder="输入头衔" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="btn btn-secondary">取消</button>
                  <button onClick={() => handleAction(selectedUser.id, 'setTitle', actionData)} className="btn btn-primary">确定</button>
                </div>
              </div>
            )}

            {actionModal === 'setRole' && (
              <div>
                <select value={actionData.role || selectedUser.role} onChange={e => setActionData({ role: e.target.value })} className="input mb-4">
                  <option value="USER">普通用户</option>
                  <option value="MODERATOR">版主</option>
                  <option value="CUSTOMER_SERVICE">客服</option>
                  <option value="ADMIN">管理员</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="btn btn-secondary">取消</button>
                  <button onClick={() => handleAction(selectedUser.id, 'setRole', actionData)} className="btn btn-primary">确定</button>
                </div>
              </div>
            )}

            {actionModal === 'ban' && (
              <div>
                <textarea value={actionData.reason || ''} onChange={e => setActionData({ ...actionData, reason: e.target.value })} className="input mb-3" placeholder="封禁原因" />
                <select value={actionData.duration || ''} onChange={e => setActionData({ ...actionData, duration: e.target.value })} className="input mb-4">
                  <option value="">永久封禁</option>
                  <option value="1d">1天</option>
                  <option value="3d">3天</option>
                  <option value="7d">7天</option>
                  <option value="30d">30天</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="btn btn-secondary">取消</button>
                  <button onClick={() => handleAction(selectedUser.id, 'ban', actionData)} className="btn btn-danger">确认封禁</button>
                </div>
              </div>
            )}

            {actionModal === 'mute' && (
              <div>
                <select value={actionData.duration || ''} onChange={e => setActionData({ ...actionData, duration: e.target.value })} className="input mb-4">
                  <option value="1d">1天</option>
                  <option value="3d">3天</option>
                  <option value="7d">7天</option>
                  <option value="30d">30天</option>
                  <option value="">永久禁言</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="btn btn-secondary">取消</button>
                  <button onClick={() => handleAction(selectedUser.id, 'mute', actionData)} className="btn btn-primary">确认禁言</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
