import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const TICKETS_URL = `${API_BASE_URL}/api/tickets`

const STATUS_COLORS = {
  OPEN: { bg: '#dbeafe', text: '#1d4ed8' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#b45309' },
  RESOLVED: { bg: '#dcfce7', text: '#15803d' },
  CLOSED: { bg: '#f1f5f9', text: '#64748b' },
  REJECTED: { bg: '#fee2e2', text: '#b91c1c' },
}

const PRIORITY_COLORS = {
  LOW: '#64748b', MEDIUM: '#2563eb', HIGH: '#d97706', URGENT: '#dc2626',
}

const WORKFLOW = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString()
}

function authHeaders(user) {
  return {
    'Content-Type': 'application/json',
    'X-User-Email': user.email,
    'X-User-Role': user.role,
  }
}

export default function AdminTicketsPage() {
  const navigate = useNavigate()
  const user = getAuthUser()

  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')

  // Status update form
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: '', rejectionReason: '', resolutionNotes: '', assignedToEmail: '' })
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Comment
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  useEffect(() => {
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      navigate('/dashboard'); return
    }
    fetchTickets()
  }, [])

  async function fetchTickets() {
    setLoading(true); setError('')
    try {
      const res = await fetch(TICKETS_URL, { headers: authHeaders(user) })
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  async function fetchComments(ticketId) {
    try {
      const res = await fetch(`${TICKETS_URL}/${ticketId}/comments`, { headers: authHeaders(user) })
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch { setComments([]) }
  }

  async function refreshSelectedTicket() {
    if (!selectedTicket) return
    try {
      const res = await fetch(`${TICKETS_URL}/${selectedTicket.id}`, { headers: authHeaders(user) })
      const data = await res.json()
      setSelectedTicket(data)
    } catch { /* silent */ }
  }

  function openDetail(ticket) {
    setSelectedTicket(ticket)
    setComments([])
    setCommentText('')
    setShowStatusForm(false)
    setStatusForm({ status: ticket.status, rejectionReason: '', resolutionNotes: ticket.resolutionNotes || '', assignedToEmail: ticket.assignedToEmail || '' })
    fetchComments(ticket.id)
  }

  async function handleUpdateStatus(e) {
    e.preventDefault()
    setUpdatingStatus(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`${TICKETS_URL}/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: authHeaders(user),
        body: JSON.stringify(statusForm),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to update status.'); return }
      setSuccess(`Ticket status updated to ${data.status}`)
      setSelectedTicket(data)
      setShowStatusForm(false)
      fetchTickets()
    } catch { setError('Cannot connect to server.') }
    finally { setUpdatingStatus(false) }
  }

  async function handleDeleteTicket(id) {
    if (!window.confirm('Permanently delete this ticket and all its comments?')) return
    try {
      await fetch(`${TICKETS_URL}/${id}`, { method: 'DELETE', headers: authHeaders(user) })
      setSelectedTicket(null)
      fetchTickets()
    } catch { setError('Failed to delete ticket.') }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    try {
      const res = await fetch(`${TICKETS_URL}/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: authHeaders(user),
        body: JSON.stringify({ content: commentText }),
      })
      if (res.ok) { setCommentText(''); fetchComments(selectedTicket.id) }
    } catch { /* silent */ }
  }

  async function handleUpdateComment(id) {
    if (!editingCommentText.trim()) return
    try {
      const res = await fetch(`${TICKETS_URL}/comments/${id}`, {
        method: 'PUT',
        headers: authHeaders(user),
        body: JSON.stringify({ content: editingCommentText }),
      })
      if (res.ok) { setEditingCommentId(null); fetchComments(selectedTicket.id) }
    } catch { /* silent */ }
  }

  async function handleDeleteComment(id) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await fetch(`${TICKETS_URL}/comments/${id}`, { method: 'DELETE', headers: authHeaders(user) })
      fetchComments(selectedTicket.id)
    } catch { /* silent */ }
  }

  const filteredTickets = tickets.filter(t => {
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
    return matchStatus && matchPriority
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  }

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #334155', color: '#94a3b8', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}>← Dashboard</button>
          <div>
            <p style={{ color: '#6366f1', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>Admin Panel</p>
            <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>🎫 Ticket Management</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>{user.role}</span>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{user.email}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: stats.total, color: '#6366f1' },
            { label: 'Open', value: stats.open, color: '#3b82f6' },
            { label: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
            { label: 'Resolved', value: stats.resolved, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1e293b', borderRadius: '1rem', padding: '1rem 1.25rem', border: '1px solid #334155' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '2rem', fontWeight: 900, margin: '0.25rem 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {error && <div style={{ background: '#450a0a', color: '#fca5a5', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ background: '#052e16', color: '#86efac', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1.5fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT: Ticket list */}
          <div>
            {/* Filters */}
            <div style={{ background: '#1e293b', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', border: '1px solid #334155', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>STATUS</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={darkSelectStyle}>
                  {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => <option key={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>PRIORITY</label>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={darkSelectStyle}>
                  {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={fetchTickets} style={{ background: '#334155', border: 'none', color: '#cbd5e1', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>↻ Refresh</button>
              </div>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
                {filteredTickets.length === 0 && <p style={{ textAlign: 'center', color: '#475569', padding: '2rem' }}>No tickets found.</p>}
                {filteredTickets.map(t => {
                  const sc = STATUS_COLORS[t.status] || STATUS_COLORS.OPEN
                  const isSelected = selectedTicket?.id === t.id
                  return (
                    <div key={t.id} onClick={() => openDetail(t)}
                      style={{ background: isSelected ? '#1e3a5f' : '#1e293b', borderRadius: '1rem', padding: '1rem 1.25rem', border: `1px solid ${isSelected ? '#3b82f6' : '#334155'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>#{t.id}</p>
                          <p style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.95rem', margin: '0.2rem 0' }}>{t.title}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {t.resource} · 🏷 {t.category}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>👤 {t.reporterEmail}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                          <span style={{ background: sc.bg, color: sc.text, borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700 }}>{t.status.replace('_', ' ')}</span>
                          <span style={{ color: PRIORITY_COLORS[t.priority], fontSize: '0.7rem', fontWeight: 700 }}>{t.priority}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Detail panel */}
          {selectedTicket && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Ticket Detail */}
              <div style={{ background: '#1e293b', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>TICKET #{selectedTicket.id}</p>
                    <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 900 }}>{selectedTicket.title}</h2>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <span>📍 {selectedTicket.resource}</span>
                      <span>🏷 {selectedTicket.category}</span>
                      <span style={{ color: PRIORITY_COLORS[selectedTicket.priority], fontWeight: 700 }}>⬆ {selectedTicket.priority}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowStatusForm(v => !v)} style={{ background: '#6366f1', border: 'none', color: '#fff', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Update Status</button>
                    <button onClick={() => handleDeleteTicket(selectedTicket.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fca5a5', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>

                {/* Status update form */}
                {showStatusForm && (
                  <form onSubmit={handleUpdateStatus} style={{ background: '#0f172a', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', border: '1px solid #334155' }}>
                    <p style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Update Ticket Status</p>

                    {/* Workflow stepper */}
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      {WORKFLOW.map((s, i) => {
                        const isActive = s === statusForm.status
                        return (
                          <button key={s} type="button" onClick={() => setStatusForm(f => ({ ...f, status: s }))}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', border: isActive ? 'none' : '1px solid #334155', background: isActive ? '#6366f1' : 'transparent', color: isActive ? '#fff' : '#64748b', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                            {i > 0 && <span style={{ marginRight: '0.25rem', opacity: 0.5 }}>→</span>}
                            {s.replace('_', ' ')}
                          </button>
                        )
                      })}
                      <button type="button" onClick={() => setStatusForm(f => ({ ...f, status: 'REJECTED' }))}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', border: statusForm.status === 'REJECTED' ? 'none' : '1px solid #7f1d1d', background: statusForm.status === 'REJECTED' ? '#dc2626' : 'transparent', color: statusForm.status === 'REJECTED' ? '#fff' : '#f87171', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                        ✕ REJECT
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div>
                        <label style={darkLabelStyle}>Assign To (email)</label>
                        <input value={statusForm.assignedToEmail} onChange={e => setStatusForm(f => ({ ...f, assignedToEmail: e.target.value }))} placeholder="technician@smartcampus.com" style={darkInputStyle} />
                      </div>
                      <div>
                        <label style={darkLabelStyle}>Resolution Notes</label>
                        <textarea value={statusForm.resolutionNotes} onChange={e => setStatusForm(f => ({ ...f, resolutionNotes: e.target.value }))} rows={2} placeholder="Describe resolution steps taken…" style={{ ...darkInputStyle, resize: 'vertical' }} />
                      </div>
                      {statusForm.status === 'REJECTED' && (
                        <div>
                          <label style={{ ...darkLabelStyle, color: '#fca5a5' }}>Rejection Reason * </label>
                          <textarea required value={statusForm.rejectionReason} onChange={e => setStatusForm(f => ({ ...f, rejectionReason: e.target.value }))} rows={2} placeholder="Reason for rejection…" style={{ ...darkInputStyle, border: '1px solid #7f1d1d', resize: 'vertical' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button type="submit" disabled={updatingStatus} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: updatingStatus ? 0.7 : 1 }}>{updatingStatus ? 'Saving…' : 'Save Changes'}</button>
                      <button type="button" onClick={() => setShowStatusForm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </form>
                )}

                <div style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '0.875rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.375rem' }}>Description</p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{selectedTicket.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div><span style={{ fontWeight: 700, color: '#94a3b8' }}>Reporter:</span> {selectedTicket.reporterEmail}</div>
                  <div><span style={{ fontWeight: 700, color: '#94a3b8' }}>Assigned:</span> {selectedTicket.assignedToEmail || 'Unassigned'}</div>
                  <div><span style={{ fontWeight: 700, color: '#94a3b8' }}>Contact:</span> {selectedTicket.contactDetails || '—'}</div>
                  <div><span style={{ fontWeight: 700, color: '#94a3b8' }}>Created:</span> {formatDate(selectedTicket.createdAt)}</div>
                </div>

                {selectedTicket.resolutionNotes && (
                  <div style={{ background: '#052e16', borderRadius: '0.75rem', padding: '0.875rem', marginTop: '0.75rem', border: '1px solid #166534' }}>
                    <p style={{ color: '#86efac', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Resolution Notes</p>
                    <p style={{ color: '#bbf7d0', fontSize: '0.9rem' }}>{selectedTicket.resolutionNotes}</p>
                  </div>
                )}
                {selectedTicket.rejectionReason && (
                  <div style={{ background: '#450a0a', borderRadius: '0.75rem', padding: '0.875rem', marginTop: '0.75rem', border: '1px solid #7f1d1d' }}>
                    <p style={{ color: '#fca5a5', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Rejection Reason</p>
                    <p style={{ color: '#fecaca', fontSize: '0.9rem' }}>{selectedTicket.rejectionReason}</p>
                  </div>
                )}

                {/* Images */}
                {(selectedTicket.imageUrl1 || selectedTicket.imageUrl2 || selectedTicket.imageUrl3) && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.375rem' }}>Attachments</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {[selectedTicket.imageUrl1, selectedTicket.imageUrl2, selectedTicket.imageUrl3].filter(Boolean).map((url, i) => (
                        <img key={i} src={url} alt={`Att ${i + 1}`} style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid #334155' }} onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div style={{ background: '#1e293b', borderRadius: '1.25rem', padding: '1.25rem', border: '1px solid #334155' }}>
                <h3 style={{ color: '#f1f5f9', fontWeight: 800, marginBottom: '0.875rem' }}>💬 Comments</h3>
                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  {comments.length === 0 && <p style={{ color: '#475569', fontSize: '0.85rem' }}>No comments yet.</p>}
                  {comments.map(c => {
                    const isOwn = c.authorEmail === user.email
                    return (
                      <div key={c.id} style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '0.75rem', border: `1px solid ${isOwn ? '#3730a3' : '#334155'}` }}>
                        {editingCommentId === c.id ? (
                          <div>
                            <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} rows={2} style={{ ...darkInputStyle, marginBottom: '0.5rem' }} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleUpdateComment(c.id)} style={darkSmallBtn('#6366f1')}>Save</button>
                              <button onClick={() => setEditingCommentId(null)} style={darkSmallBtn('#334155')}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>{c.authorEmail} <span style={{ color: '#475569' }}>({c.authorRole})</span></span>
                              <span style={{ color: '#475569', fontSize: '0.7rem' }}>{formatDate(c.createdAt)}</span>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>{c.content}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
                              {isOwn && <button onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content) }} style={darkSmallBtn('#6366f1')}>Edit</button>}
                              <button onClick={() => handleDeleteComment(c.id)} style={darkSmallBtn('#7f1d1d')}>Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment…" rows={2} style={{ ...darkInputStyle, flex: 1, resize: 'none' }} />
                  <button onClick={handleAddComment} style={{ padding: '0 1rem', borderRadius: '0.75rem', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Post</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const darkSelectStyle = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '0.5rem',
  padding: '0.4rem 0.75rem',
  color: '#cbd5e1',
  fontSize: '0.8rem',
  cursor: 'pointer',
}

const darkInputStyle = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  borderRadius: '0.625rem',
  border: '1px solid #334155',
  background: '#1e293b',
  color: '#f1f5f9',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const darkLabelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#64748b',
  marginBottom: '0.25rem',
  textTransform: 'uppercase',
}

function darkSmallBtn(bg) {
  return {
    padding: '0.2rem 0.625rem',
    borderRadius: '0.375rem',
    border: 'none',
    background: bg,
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.7rem',
    cursor: 'pointer',
  }
}
