import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const TICKETS_URL = `${API_BASE_URL}/api/tickets`

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'HVAC', 'FURNITURE', 'GENERAL']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const STATUS_COLORS = {
  OPEN: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  RESOLVED: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

const PRIORITY_COLORS = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-amber-600',
  URGENT: 'text-red-600',
}

const emptyForm = {
  title: '',
  resource: '',
  category: 'GENERAL',
  description: '',
  priority: 'MEDIUM',
  contactDetails: '',
}

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

export default function TicketsPage() {
  const navigate = useNavigate()
  const user = getAuthUser()

  const [view, setView] = useState('list') // 'list' | 'create' | 'detail'
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([null, null, null])
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const isStaff = ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(user?.role)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchTickets()
  }, [])

  async function fetchTickets() {
    setLoading(true); setError('')
    try {
      const endpoint = isStaff ? TICKETS_URL : `${TICKETS_URL}/mine`
      const res = await fetch(endpoint, { headers: authHeaders(user) })
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch {
      setError('Cannot connect to server.')
    } finally { setLoading(false) }
  }

  async function fetchComments(ticketId) {
    try {
      const res = await fetch(`${TICKETS_URL}/${ticketId}/comments`, { headers: authHeaders(user) })
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch { setComments([]) }
  }

  function openDetail(ticket) {
    setSelectedTicket(ticket)
    setComments([])
    setCommentText('')
    setView('detail')
    fetchComments(ticket.id)
  }

  function handleImageChange(index, e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const updated = [...images]
      updated[index] = reader.result
      setImages(updated)
    }
    reader.readAsDataURL(file)
  }

  async function handleCreateTicket(e) {
    e.preventDefault()
    setSubmitting(true); setError(''); setSuccess('')
    const payload = {
      ...form,
      imageBase64_1: images[0],
      imageBase64_2: images[1],
      imageBase64_3: images[2],
    }
    try {
      const res = await fetch(TICKETS_URL, {
        method: 'POST',
        headers: authHeaders(user),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to create ticket.'); return }
      setSuccess('Ticket created successfully!')
      setForm(emptyForm); setImages([null, null, null])
      fetchTickets()
      setTimeout(() => { setSuccess(''); setView('list') }, 1500)
    } catch { setError('Cannot connect to server.') }
    finally { setSubmitting(false) }
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
      await fetch(`${TICKETS_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: authHeaders(user),
      })
      fetchComments(selectedTicket.id)
    } catch { /* silent */ }
  }

  const filteredTickets = filterStatus === 'ALL' ? tickets : tickets.filter(t => t.status === filterStatus)

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5efe8 0%, #e8f0fe 100%)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#cbd5e1', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}>← Back</button>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Smart Campus</p>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>🎫 Maintenance Tickets</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>{user.role}</span>
          <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>{user.email}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '0.375rem 0.875rem', borderRadius: '999px', border: filterStatus === s ? 'none' : '1px solid #cbd5e1', background: filterStatus === s ? '#1e293b' : '#fff', color: filterStatus === s ? '#fff' : '#64748b', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => fetchTickets()} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>↻ Refresh</button>
            <button onClick={() => { setView('create'); setError(''); setSuccess('') }} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>+ Raise Ticket</button>
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>{success}</div>}

        {/* ── LIST VIEW ────────────────────────────────── */}
        {view === 'list' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading tickets…</div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ textAlign: 'center', background: '#fff', borderRadius: '1.5rem', padding: '4rem', color: '#94a3b8', boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: '3rem' }}>🎫</div>
                <p style={{ fontWeight: 700, fontSize: '1.125rem', marginTop: '0.75rem' }}>No tickets found</p>
                <p style={{ marginTop: '0.25rem' }}>Click "Raise Ticket" to report an issue.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredTickets.map(t => {
                  const sc = STATUS_COLORS[t.status] || STATUS_COLORS.OPEN
                  return (
                    <div key={t.id} onClick={() => openDetail(t)} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.13)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>#{t.id}</span>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{t.title}</span>
                            <span className={PRIORITY_COLORS[t.priority]} style={{ fontWeight: 700, fontSize: '0.75rem' }}>⬆ {t.priority}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {t.resource}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>🏷 {t.category}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>👤 {t.reporterEmail}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.description}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }} className={`${sc.bg} ${sc.text}`}>
                            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', display: 'inline-block' }} className={sc.dot}></span>
                            {t.status.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(t.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE VIEW ───────────────────────────────── */}
        {view === 'create' && (
          <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>← Back to list</button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginTop: '0.5rem' }}>Raise a New Ticket</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Report a maintenance or incident issue. Fields marked * are required.</p>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Projector not working in Hall A3" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Resource / Location *</label>
                  <input required value={form.resource} onChange={e => setForm({ ...form, resource: e.target.value })} placeholder="e.g. Hall A3, Computer Lab B2" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority *</label>
                  <select required value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description *</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail…" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Preferred Contact Details</label>
                  <input value={form.contactDetails} onChange={e => setForm({ ...form, contactDetails: e.target.value })} placeholder="Phone number or email for follow-up" style={inputStyle} />
                </div>

                {/* Image Uploads */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Evidence Images (up to 3)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ border: '2px dashed #cbd5e1', borderRadius: '1rem', padding: '1rem', textAlign: 'center', background: '#f8fafc' }}>
                        {images[i] ? (
                          <div>
                            <img src={images[i]} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                            <button type="button" onClick={() => { const u = [...images]; u[i] = null; setImages(u) }} style={{ marginTop: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>Remove</button>
                          </div>
                        ) : (
                          <label style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: '2rem' }}>📷</div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Image {i + 1}</p>
                            <input type="file" accept="image/*" onChange={e => handleImageChange(i, e)} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={submitting} style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: submitting ? 0.6 : 1, boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                  {submitting ? 'Submitting…' : '🎫 Submit Ticket'}
                </button>
                <button type="button" onClick={() => setView('list')} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── DETAIL VIEW ───────────────────────────────── */}
        {view === 'detail' && selectedTicket && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left' }}>← Back to list</button>

            {/* Ticket info */}
            <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>TICKET #{selectedTicket.id}</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', margin: '0.25rem 0' }}>{selectedTicket.title}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                    <span>📍 {selectedTicket.resource}</span>
                    <span>🏷 {selectedTicket.category}</span>
                    <span className={PRIORITY_COLORS[selectedTicket.priority]} style={{ fontWeight: 700 }}>⬆ {selectedTicket.priority}</span>
                  </div>
                </div>
                {(() => {
                  const sc = STATUS_COLORS[selectedTicket.status] || STATUS_COLORS.OPEN
                  return <span style={{ borderRadius: '999px', padding: '0.4rem 1.25rem', fontWeight: 700, fontSize: '0.85rem' }} className={`${sc.bg} ${sc.text}`}>{selectedTicket.status.replace('_', ' ')}</span>
                })()}
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 700, color: '#475569', marginBottom: '0.4rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</p>
                <p style={{ color: '#334155' }}>{selectedTicket.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                <div><span style={{ fontWeight: 700 }}>Reporter:</span> {selectedTicket.reporterEmail}</div>
                <div><span style={{ fontWeight: 700 }}>Assigned to:</span> {selectedTicket.assignedToEmail || 'Unassigned'}</div>
                <div><span style={{ fontWeight: 700 }}>Contact:</span> {selectedTicket.contactDetails || '—'}</div>
                <div><span style={{ fontWeight: 700 }}>Created:</span> {formatDate(selectedTicket.createdAt)}</div>
                <div><span style={{ fontWeight: 700 }}>Updated:</span> {formatDate(selectedTicket.updatedAt)}</div>
              </div>

              {selectedTicket.resolutionNotes && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '1rem', padding: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#15803d', fontSize: '0.8rem', textTransform: 'uppercase' }}>Resolution Notes</p>
                  <p style={{ color: '#166534' }}>{selectedTicket.resolutionNotes}</p>
                </div>
              )}
              {selectedTicket.rejectionReason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '1rem', padding: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rejection Reason</p>
                  <p style={{ color: '#991b1b' }}>{selectedTicket.rejectionReason}</p>
                </div>
              )}

              {/* Image attachments */}
              {(selectedTicket.imageUrl1 || selectedTicket.imageUrl2 || selectedTicket.imageUrl3) && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#475569', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Attachments</p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[selectedTicket.imageUrl1, selectedTicket.imageUrl2, selectedTicket.imageUrl3].filter(Boolean).map((url, i) => (
                      <img key={i} src={url} alt={`Attachment ${i + 1}`} style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>💬 Comments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {comments.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No comments yet. Be the first to comment!</p>}
                {comments.map(c => {
                  const isOwn = c.authorEmail === user.email
                  const isAdmin = user.role === 'ADMIN'
                  return (
                    <div key={c.id} style={{ background: isOwn ? '#f0f4ff' : '#f8fafc', borderRadius: '1rem', padding: '0.875rem 1rem', border: `1px solid ${isOwn ? '#c7d2fe' : '#e2e8f0'}` }}>
                      {editingCommentId === c.id ? (
                        <div>
                          <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} rows={2} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleUpdateComment(c.id)} style={smallBtnStyle('#6366f1')}>Save</button>
                            <button onClick={() => setEditingCommentId(null)} style={smallBtnStyle('#94a3b8')}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569' }}>{c.authorEmail} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({c.authorRole})</span></span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(c.createdAt)}</span>
                          </div>
                          <p style={{ color: '#334155', fontSize: '0.9rem' }}>{c.content}</p>
                          {(isOwn || isAdmin) && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {isOwn && <button onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content) }} style={smallBtnStyle('#6366f1')}>Edit</button>}
                              <button onClick={() => handleDeleteComment(c.id)} style={smallBtnStyle('#ef4444')}>Delete</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment…" rows={2} style={{ ...inputStyle, flex: 1, resize: 'none' }} />
                <button onClick={handleAddComment} style={{ padding: '0 1.25rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Post</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.8rem',
  color: '#475569',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#f8fafc',
  color: '#1e293b',
}

function smallBtnStyle(color) {
  return {
    padding: '0.2rem 0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: color,
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.75rem',
    cursor: 'pointer',
  }
}
