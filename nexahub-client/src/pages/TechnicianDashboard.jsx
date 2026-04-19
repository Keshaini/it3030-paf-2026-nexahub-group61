import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const TICKETS_URL = `${API_BASE_URL}/api/tickets`

const workOrders = [
  { title: 'Projector replacement - Hall A3', status: 'Assigned', priority: 'High' },
  { title: 'AC inspection - Lab C2', status: 'In progress', priority: 'Medium' },
  { title: 'Network port fault - Admin block', status: 'Queued', priority: 'Low' },
]

const technicianMetrics = [
  { label: 'Open work orders', value: '14' },
  { label: 'Resolved this week', value: '39' },
  { label: 'Average response', value: '18 min' },
]

const STATUS_COLORS = {
  OPEN: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700' },
  RESOLVED: { bg: 'bg-green-100', text: 'text-green-700' },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-500' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
}

const TECH_WORKFLOW = ['OPEN', 'IN_PROGRESS', 'RESOLVED']

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString()
}

function authHeaders(user) {
  return {
    'Content-Type': 'application/json',
    'X-User-Email': user.email,
    'X-User-Role': user.role,
  }
}

const TechnicianDashboard = () => {
  const navigate = useNavigate()
  const user = getAuthUser()

  const [activeSection, setActiveSection] = useState('dashboard') // 'dashboard' | 'tickets'

  // Assigned tickets state
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [ticketError, setTicketError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [statusForm, setStatusForm] = useState({ status: '', resolutionNotes: '' })
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login', { replace: true })
  }

  async function fetchAssignedTickets() {
    setLoadingTickets(true)
    setTicketError('')
    try {
      const res = await fetch(`${TICKETS_URL}/assigned`, { headers: authHeaders(user) })
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch {
      setTicketError('Cannot connect to server.')
    } finally {
      setLoadingTickets(false)
    }
  }

  async function fetchComments(ticketId) {
    try {
      const res = await fetch(`${TICKETS_URL}/${ticketId}/comments`, { headers: authHeaders(user) })
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch { setComments([]) }
  }

  function openTicket(ticket) {
    setSelectedTicket(ticket)
    setStatusForm({ status: ticket.status, resolutionNotes: ticket.resolutionNotes || '' })
    setStatusMsg('')
    setCommentText('')
    setEditingCommentId(null)
    fetchComments(ticket.id)
  }

  async function handleUpdateStatus(e) {
    e.preventDefault()
    setUpdatingStatus(true)
    setStatusMsg('')
    try {
      const res = await fetch(`${TICKETS_URL}/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: authHeaders(user),
        body: JSON.stringify({ status: statusForm.status, resolutionNotes: statusForm.resolutionNotes }),
      })
      const data = await res.json()
      if (!res.ok) { setStatusMsg(data.message || 'Failed to update.'); return }
      setStatusMsg(`Status updated to ${data.status}`)
      setSelectedTicket(data)
      setTickets(prev => prev.map(t => t.id === data.id ? data : t))
    } catch { setStatusMsg('Cannot connect to server.') }
    finally { setUpdatingStatus(false) }
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

  useEffect(() => {
    if (activeSection === 'tickets') fetchAssignedTickets()
  }, [activeSection])

  return (
    <div className="min-h-screen bg-[#f1f7fb] p-3 sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl gap-4 rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl lg:grid-cols-[280px_minmax(0,1fr)] lg:p-6">

        {/* ── Sidebar (original style preserved) ────────────────────────── */}
        <aside className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Technician Desk</p>
              <h1 className="text-2xl font-black">Maintenance Hub</h1>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-100">Signed in as</p>
            <p className="mt-2 text-xl font-bold">{user?.fullName || 'Technician'}</p>
            <p className="text-sm text-cyan-100">{user?.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-cyan-400/20 px-2 py-1 text-xs font-semibold text-cyan-100">TECHNICIAN</p>
          </div>

          <div className="mt-6 space-y-2 text-sm text-slate-200">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full rounded-xl px-3 py-2 text-left font-semibold transition ${activeSection === 'dashboard' ? 'bg-white/10' : 'hover:bg-white/10'}`}
            >
              Work Orders
            </button>
            <button
              onClick={() => setActiveSection('tickets')}
              className={`w-full rounded-xl px-3 py-2 text-left transition ${activeSection === 'tickets' ? 'bg-cyan-500/20 text-cyan-200 font-semibold' : 'hover:bg-white/10'}`}
            >
              🎫 Assigned Tickets
            </button>
            <p className="rounded-xl px-3 py-2 hover:bg-white/10">Assets</p>
            <p className="rounded-xl px-3 py-2 hover:bg-white/10">Service Logs</p>
          </div>

          <button onClick={handleLogout} className="mt-8 w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10">
            Logout
          </button>
        </aside>

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <main className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">

          {/* ── Dashboard section (original) ─────────────────────────────── */}
          {activeSection === 'dashboard' && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Technician Dashboard</p>
                  <h2 className="text-2xl font-black text-slate-900">Tasks and maintenance flow</h2>
                </div>
                <button className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white">New Work Order</button>
              </div>

              <section className="grid gap-4 md:grid-cols-3">
                {technicianMetrics.map((metric) => (
                  <article key={metric.label} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{metric.value}</p>
                  </article>
                ))}
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-black text-slate-900">Active work orders</h3>
                <div className="mt-4 space-y-3">
                  {workOrders.map((order) => (
                    <div key={order.title} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">{order.title}</p>
                          <p className="text-sm text-slate-500">Priority: {order.priority}</p>
                        </div>
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── Assigned Tickets section ─────────────────────────────────── */}
          {activeSection === 'tickets' && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned to me</p>
                  <h2 className="text-2xl font-black text-slate-900">🎫 My Assigned Tickets</h2>
                </div>
                <button onClick={fetchAssignedTickets} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  ↻ Refresh
                </button>
              </div>

              {ticketError && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{ticketError}</div>
              )}

              {loadingTickets ? (
                <p className="py-10 text-center text-slate-500">Loading assigned tickets…</p>
              ) : tickets.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 py-16 text-center">
                  <p className="text-4xl">🎫</p>
                  <p className="mt-3 text-lg font-bold text-slate-700">No tickets assigned to you yet</p>
                  <p className="mt-1 text-sm text-slate-400">When an admin assigns a ticket to your email, it will appear here.</p>
                </div>
              ) : (
                <div className={`grid gap-5 ${selectedTicket ? 'lg:grid-cols-[1fr_1.5fr]' : ''}`}>

                  {/* Ticket list */}
                  <div className="space-y-3">
                    {tickets.map(t => {
                      const sc = STATUS_COLORS[t.status] || STATUS_COLORS.OPEN
                      const isSelected = selectedTicket?.id === t.id
                      return (
                        <div
                          key={t.id}
                          onClick={() => openTicket(t)}
                          className={`cursor-pointer rounded-2xl border p-4 transition hover:shadow-md ${isSelected ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200'}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-400">#{t.id}</p>
                              <p className="mt-1 font-bold text-slate-900">{t.title}</p>
                              <p className="mt-1 text-sm text-slate-500">📍 {t.resource} · 🏷 {t.category}</p>
                              <p className="mt-1 text-xs text-slate-400">Reporter: {t.reporterEmail}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                                {t.status.replace('_', ' ')}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{t.priority}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Detail panel */}
                  {selectedTicket && (
                    <div className="space-y-4">

                      {/* Ticket info */}
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-400">TICKET #{selectedTicket.id}</p>
                            <h3 className="mt-0.5 text-xl font-black text-slate-900">{selectedTicket.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">📍 {selectedTicket.resource} · 🏷 {selectedTicket.category} · ⬆ {selectedTicket.priority}</p>
                          </div>
                          {(() => {
                            const sc = STATUS_COLORS[selectedTicket.status] || STATUS_COLORS.OPEN
                            return <span className={`rounded-full px-3 py-1 text-sm font-bold ${sc.bg} ${sc.text}`}>{selectedTicket.status.replace('_', ' ')}</span>
                          })()}
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase text-slate-400">Description</p>
                          <p className="mt-1 text-sm text-slate-700">{selectedTicket.description}</p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500">
                          <p><span className="font-semibold text-slate-700">Reporter:</span> {selectedTicket.reporterEmail}</p>
                          <p><span className="font-semibold text-slate-700">Contact:</span> {selectedTicket.contactDetails || '—'}</p>
                          <p><span className="font-semibold text-slate-700">Created:</span> {formatDate(selectedTicket.createdAt)}</p>
                          <p><span className="font-semibold text-slate-700">Updated:</span> {formatDate(selectedTicket.updatedAt)}</p>
                        </div>

                        {selectedTicket.resolutionNotes && (
                          <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                            <p className="font-bold uppercase text-green-600" style={{ fontSize: '0.7rem' }}>Resolution Notes</p>
                            <p className="mt-1">{selectedTicket.resolutionNotes}</p>
                          </div>
                        )}

                        {/* Evidence images */}
                        {(selectedTicket.imageUrl1 || selectedTicket.imageUrl2 || selectedTicket.imageUrl3) && (
                          <div className="mt-3">
                            <p className="mb-2 text-xs font-bold uppercase text-slate-400">Evidence</p>
                            <div className="flex gap-2">
                              {[selectedTicket.imageUrl1, selectedTicket.imageUrl2, selectedTicket.imageUrl3].filter(Boolean).map((url, i) => (
                                <img key={i} src={url} alt={`Evidence ${i + 1}`} onClick={() => window.open(url, '_blank')}
                                  className="h-20 w-28 cursor-pointer rounded-xl border border-slate-200 object-cover" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Update status */}
                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                        <h4 className="mb-3 font-black text-slate-900">Update Status & Resolution</h4>
                        <form onSubmit={handleUpdateStatus} className="space-y-3">
                          {/* Workflow buttons */}
                          <div className="flex flex-wrap gap-2">
                            {TECH_WORKFLOW.map((s, idx) => {
                              const isActive = statusForm.status === s
                              return (
                                <button key={s} type="button" onClick={() => setStatusForm(f => ({ ...f, status: s }))}
                                  className={`rounded-full px-3 py-1 text-sm font-bold transition ${isActive ? 'bg-cyan-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}>
                                  {idx > 0 && <span className="mr-1 opacity-40">→</span>}
                                  {s.replace('_', ' ')}
                                </button>
                              )
                            })}
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                              Resolution Notes {statusForm.status === 'RESOLVED' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                              value={statusForm.resolutionNotes}
                              onChange={e => setStatusForm(f => ({ ...f, resolutionNotes: e.target.value }))}
                              required={statusForm.status === 'RESOLVED'}
                              rows={3}
                              placeholder="Describe what was done to fix the issue…"
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cyan-300"
                            />
                          </div>

                          {statusMsg && (
                            <p className={`text-sm font-semibold ${statusMsg.includes('updated') ? 'text-green-600' : 'text-red-600'}`}>{statusMsg}</p>
                          )}

                          <button type="submit" disabled={updatingStatus}
                            className="rounded-xl bg-cyan-600 px-5 py-2 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-60">
                            {updatingStatus ? 'Saving…' : '✓ Save Update'}
                          </button>
                        </form>
                      </div>

                      {/* Comments */}
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <h4 className="mb-4 font-black text-slate-900">💬 Comments</h4>

                        <div className="mb-4 max-h-56 space-y-3 overflow-y-auto">
                          {comments.length === 0 && (
                            <p className="text-sm text-slate-400">No comments yet. Add the first one!</p>
                          )}
                          {comments.map(c => {
                            const isOwn = c.authorEmail === user.email
                            return (
                              <div key={c.id} className={`rounded-xl border p-3 ${isOwn ? 'border-cyan-200 bg-cyan-50' : 'border-slate-200 bg-slate-50'}`}>
                                {editingCommentId === c.id ? (
                                  <div>
                                    <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} rows={2}
                                      className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                                    <div className="flex gap-2">
                                      <button onClick={() => handleUpdateComment(c.id)} className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-bold text-white">Save</button>
                                      <button onClick={() => setEditingCommentId(null)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="mb-1 flex justify-between">
                                      <span className="text-xs font-bold text-slate-600">{c.authorEmail} <span className="font-normal text-slate-400">({c.authorRole})</span></span>
                                      <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-slate-700">{c.content}</p>
                                    {isOwn && (
                                      <div className="mt-2 flex gap-2">
                                        <button onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content) }} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white">Edit</button>
                                        <button onClick={() => handleDeleteComment(c.id)} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white">Delete</button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex gap-3">
                          <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                            placeholder="Add a work note or comment…" rows={2}
                            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300" />
                          <button onClick={handleAddComment} className="rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">Post</button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default TechnicianDashboard