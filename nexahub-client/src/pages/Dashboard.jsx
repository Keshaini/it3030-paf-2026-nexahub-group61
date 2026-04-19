import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const NOTIFICATION_API_URL = `${API_BASE_URL}/api/auth/notification-preferences`
const TICKETS_URL = `${API_BASE_URL}/api/tickets`

const notificationCategoryLabels = {
  BOOKING_UPDATES: 'Booking Updates',
  MAINTENANCE_ALERTS: 'Maintenance Alerts',
  SYSTEM_ANNOUNCEMENTS: 'System Announcements',
  SECURITY_NOTICES: 'Security Notices',
}

const taskCards = [
  { title: 'My booking requests', items: '4 active requests', progress: '72%', color: 'bg-violet-700', accent: 'bg-violet-200' },
  { title: 'Pending approvals', items: '2 awaiting review', progress: '40%', color: 'bg-cyan-500', accent: 'bg-cyan-200' },
  { title: 'Resolved incidents', items: '9 completed items', progress: '88%', color: 'bg-orange-500', accent: 'bg-orange-200' },
]

const todayTasks = [
  { name: 'Projector fault - Hall A3', detail: 'Assigned to technician', color: 'bg-orange-500' },
  { name: 'Computer Lab B booking', detail: 'Pending admin approval', color: 'bg-violet-700' },
  { name: 'Mic set replacement', detail: 'Resolved and closed', color: 'bg-cyan-500' },
]

const calendarItems = [
  { time: '10:00', title: 'Lab C2 Inspection', subtitle: 'Maintenance' },
  { time: '13:20', title: 'Room 402 Booking', subtitle: 'Faculty Request' },
  { time: '15:00', title: 'Asset Audit Update', subtitle: 'Admin Workflow' },
]

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'HVAC', 'FURNITURE', 'GENERAL']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const STATUS_COLORS = {
  OPEN: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700' },
  RESOLVED: { bg: 'bg-green-100', text: 'text-green-700' },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-500' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
}

const emptyForm = { title: '', resource: '', category: 'GENERAL', description: '', priority: 'MEDIUM', contactDetails: '' }

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString()
}

function authHeaders(user) {
  return { 'Content-Type': 'application/json', 'X-User-Email': user.email, 'X-User-Role': user.role }
}

const Dashboard = () => {
  const navigate = useNavigate()
  const user = getAuthUser()

  // ── Section state ─────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('dashboard') // 'dashboard' | 'tickets'

  // ── Notification state ────────────────────────────────────────────────────
  const [notificationPreferences, setNotificationPreferences] = useState({})
  const [notificationStatus, setNotificationStatus] = useState('')
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const [isNotificationSaving, setIsNotificationSaving] = useState(false)

  // ── Ticket state ──────────────────────────────────────────────────────────
  const [ticketView, setTicketView] = useState('list') // 'list' | 'create' | 'detail'
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [ticketError, setTicketError] = useState('')
  const [ticketSuccess, setTicketSuccess] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([null, null, null])
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [confirmModal, setConfirmModal] = useState(null) // { message, onConfirm }

  // ── Notification fetch ────────────────────────────────────────────────────
  const fetchNotificationPreferences = async () => {
    if (!user?.email) return
    setIsNotificationLoading(true)
    setNotificationStatus('')
    try {
      const response = await fetch(`${NOTIFICATION_API_URL}?email=${encodeURIComponent(user.email)}`)
      const data = await response.json()
      if (!response.ok) { setNotificationStatus(data.message || 'Failed to load notification preferences.'); return }
      setNotificationPreferences(data.preferences || {})
    } catch {
      setNotificationStatus('Cannot connect to server. Please start backend and try again.')
    } finally { setIsNotificationLoading(false) }
  }

  useEffect(() => {
    if (user?.email) fetchNotificationPreferences()
  }, [user?.email])

  // ── Ticket fetch ──────────────────────────────────────────────────────────
  async function fetchMyTickets() {
    setLoadingTickets(true); setTicketError('')
    try {
      const res = await fetch(`${TICKETS_URL}/mine`, { headers: authHeaders(user) })
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch { setTicketError('Cannot connect to server.') }
    finally { setLoadingTickets(false) }
  }

  async function fetchComments(ticketId) {
    try {
      const res = await fetch(`${TICKETS_URL}/${ticketId}/comments`, { headers: authHeaders(user) })
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch { setComments([]) }
  }

  useEffect(() => {
    if (activeSection === 'tickets') fetchMyTickets()
  }, [activeSection])

  if (!user) return <Navigate to="/login" replace />

  const userItNumber = user.itNumber || user.itNo || localStorage.getItem('auth_it_number') || 'IT Number'

  // ── Notification handlers ─────────────────────────────────────────────────
  const handleNotificationToggle = (category) => {
    setNotificationStatus('')
    setNotificationPreferences((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const handleSaveNotificationPreferences = async () => {
    if (!user?.email) return
    setIsNotificationSaving(true); setNotificationStatus('')
    try {
      const response = await fetch(NOTIFICATION_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, preferences: notificationPreferences }),
      })
      const data = await response.json()
      if (!response.ok) { setNotificationStatus(data.message || 'Failed to save notification preferences.'); return }
      setNotificationPreferences(data.preferences || {})
      setNotificationStatus('Notification preferences saved.')
    } catch {
      setNotificationStatus('Cannot connect to server. Please start backend and try again.')
    } finally { setIsNotificationSaving(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  // ── Ticket handlers ───────────────────────────────────────────────────────
  function openDetail(ticket) {
    setSelectedTicket(ticket)
    setComments([])
    setCommentText('')
    setTicketView('detail')
    fetchComments(ticket.id)
  }

  function handleImageChange(index, e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const u = [...images]; u[index] = reader.result; setImages(u) }
    reader.readAsDataURL(file)
  }

  async function handleDeleteMyTicket(e, ticketId) {
    e.stopPropagation()
    setConfirmModal({
      message: 'Are you sure you want to delete this ticket? This cannot be undone.',
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          await fetch(`${TICKETS_URL}/${ticketId}`, { method: 'DELETE', headers: authHeaders(user) })
          if (selectedTicket?.id === ticketId) setSelectedTicket(null)
          fetchMyTickets()
        } catch { setTicketError('Failed to delete ticket.') }
      },
    })
  }

  async function handleCreateTicket(e) {
    e.preventDefault()
    setSubmitting(true); setTicketError(''); setTicketSuccess('')
    try {
      const res = await fetch(TICKETS_URL, {
        method: 'POST',
        headers: authHeaders(user),
        body: JSON.stringify({ ...form, imageBase64_1: images[0], imageBase64_2: images[1], imageBase64_3: images[2] }),
      })
      const data = await res.json()
      if (!res.ok) { setTicketError(data.message || 'Failed to create ticket.'); return }
      setTicketSuccess('Ticket created successfully!')
      setForm(emptyForm); setImages([null, null, null])
      fetchMyTickets()
      setTimeout(() => { setTicketSuccess(''); setTicketView('list') }, 1500)
    } catch { setTicketError('Cannot connect to server.') }
    finally { setSubmitting(false) }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    try {
      const res = await fetch(`${TICKETS_URL}/${selectedTicket.id}/comments`, {
        method: 'POST', headers: authHeaders(user), body: JSON.stringify({ content: commentText }),
      })
      if (res.ok) { setCommentText(''); fetchComments(selectedTicket.id) }
    } catch { /* silent */ }
  }

  async function handleUpdateComment(id) {
    if (!editingCommentText.trim()) return
    try {
      const res = await fetch(`${TICKETS_URL}/comments/${id}`, {
        method: 'PUT', headers: authHeaders(user), body: JSON.stringify({ content: editingCommentText }),
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

  const filteredTickets = filterStatus === 'ALL' ? tickets : tickets.filter(t => t.status === filterStatus)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Confirm modal ────────────────────────────────────────────── */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗑️</div>
            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Delete Ticket</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.875rem', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.875rem', border: 'none', background: '#ef4444', fontWeight: 700, fontSize: '0.9rem', color: '#fff', cursor: 'pointer' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen w-screen overflow-hidden bg-[#f5efe8] p-2 sm:p-3 lg:p-4">
      <div className="grid h-full w-full gap-3 rounded-[2rem] bg-slate-50 p-3 shadow-2xl lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:p-4">

        {/* ── Left Sidebar (original style) ──────────────────────────────── */}
        <aside className="overflow-auto rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100 p-4">
            <p className="text-xs uppercase text-slate-500">Logged in as</p>
            <p className="mt-1 text-[1.85rem] font-bold leading-tight text-slate-900 break-words">{user.fullName || 'User'}</p>
            <p className="text-sm text-slate-600 break-all">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{user.role || 'USER'}</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${activeSection === 'dashboard' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveSection('tickets'); setTicketView('list') }}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${activeSection === 'tickets' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
            >
              🎫 My Tickets
            </button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">My Bookings</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">My Requests</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Notifications</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Profile</button>
          </nav>

          <button onClick={handleLogout} className="mt-10 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Logout
          </button>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="overflow-auto rounded-[1.5rem] bg-white p-6">

          {/* Top nav bar (always visible) */}
          <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">University Operations</p>
              <p className="text-sm font-bold text-slate-800">Bookings, incidents, and audits in one place</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Notifications</button>
              <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Quick Actions</button>
            </div>
          </nav>

          {/* ── DASHBOARD SECTION ────────────────────────────────────────── */}
          {activeSection === 'dashboard' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-black text-slate-900">Hello, {userItNumber}</h1>
                  <p className="text-sm text-slate-500">Your bookings, requests, and status updates at a glance.</p>
                </div>
                <button
                  onClick={() => { setActiveSection('tickets'); setTicketView('create') }}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
                >
                  🎫 Raise Ticket
                </button>
              </div>

              <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Notification Preferences</h2>
                    <p className="text-sm text-slate-500">Enable or disable categories for your account notifications.</p>
                  </div>
                  <button type="button" onClick={handleSaveNotificationPreferences} disabled={isNotificationSaving || isNotificationLoading}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    {isNotificationSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>

                {notificationStatus ? <p className="mt-3 text-sm text-slate-700">{notificationStatus}</p> : null}

                {isNotificationLoading ? (
                  <p className="mt-3 text-sm text-slate-500">Loading notification preferences...</p>
                ) : (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {Object.keys(notificationCategoryLabels).map((category) => {
                      const isEnabled = Boolean(notificationPreferences[category])
                      return (
                        <label key={category} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <span className="text-sm font-semibold text-slate-700">{notificationCategoryLabels[category]}</span>
                          <input type="checkbox" checked={isEnabled} onChange={() => handleNotificationToggle(category)} className="h-5 w-5 accent-slate-900" />
                        </label>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="mt-6 grid gap-4 md:grid-cols-3">
                {taskCards.map((card) => (
                  <article key={card.title} className={`${card.color} rounded-2xl p-5 text-white`}>
                    <h3 className="text-xl font-extrabold leading-tight">{card.title}</h3>
                    <p className="mt-4 text-sm opacity-90">{card.items}</p>
                    <div className="mt-3 h-2 rounded-full bg-white/30">
                      <div className={`${card.accent} h-2 rounded-full`} style={{ width: card.progress }}></div>
                    </div>
                    <p className="mt-2 text-xs font-semibold opacity-90">{card.progress}</p>
                  </article>
                ))}
              </section>

              <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h2 className="mb-4 text-2xl font-black text-slate-900">Recent activity</h2>
                  <div className="space-y-3">
                    {todayTasks.map((task) => (
                      <div key={task.name} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start gap-3">
                          <span className={`${task.color} mt-1 h-3 w-3 rounded-full`}></span>
                          <div>
                            <p className="font-bold text-slate-900">{task.name}</p>
                            <p className="text-sm text-slate-500">{task.detail}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Tracked</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="mb-4 text-2xl font-black text-slate-900">Summary</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-3xl font-black text-slate-900">28 h</p>
                      <p className="text-sm text-slate-500">Avg. response time</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-3xl font-black text-slate-900">18</p>
                      <p className="text-sm text-slate-500">Completed requests</p>
                    </div>
                    <div className="col-span-2 rounded-2xl bg-slate-900 p-4 text-white">
                      <p className="text-sm uppercase tracking-wide text-slate-300">Auditability</p>
                      <p className="mt-2 text-lg font-bold">Every request update is recorded with timestamp and actor.</p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ── MY TICKETS SECTION ───────────────────────────────────────── */}
          {activeSection === 'tickets' && (
            <>
              {/* Header */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-black text-slate-900">🎫 My Tickets</h1>
                  <p className="text-sm text-slate-500">Raise and track your maintenance & incident reports.</p>
                </div>
                <div className="flex gap-2">
                  {ticketView !== 'create' && (
                    <button onClick={() => { setTicketView('create'); setTicketError(''); setTicketSuccess('') }}
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
                      + Raise Ticket
                    </button>
                  )}
                  {ticketView !== 'list' && (
                    <button onClick={() => setTicketView('list')} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      ← Back to list
                    </button>
                  )}
                  {ticketView === 'list' && (
                    <button onClick={fetchMyTickets} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">↻</button>
                  )}
                </div>
              </div>

              {ticketError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{ticketError}</div>}
              {ticketSuccess && <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">{ticketSuccess}</div>}

              {/* ── Create form ──────────────────────────────────────────── */}
              {ticketView === 'create' && (
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Title *</label>
                      <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Projector not working in Hall A3"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Location / Resource *</label>
                      <input required value={form.resource} onChange={e => setForm({ ...form, resource: e.target.value })}
                        placeholder="e.g. Hall A3, Lab B2"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Category *</label>
                      <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Priority *</label>
                      <select required value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300">
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Description *</label>
                      <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe the issue in detail…" rows={3}
                        className="w-full resize-vertical rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Preferred Contact</label>
                      <input value={form.contactDetails} onChange={e => setForm({ ...form, contactDetails: e.target.value })}
                        placeholder="Phone or email for follow-up"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                    </div>

                    {/* Image uploads */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Evidence Images (up to 3)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 text-center">
                            {images[i] ? (
                              <div>
                                <img src={images[i]} alt={`Preview ${i + 1}`} className="mx-auto h-20 w-full rounded-lg object-cover" />
                                <button type="button" onClick={() => { const u = [...images]; u[i] = null; setImages(u) }}
                                  className="mt-2 rounded-lg bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">Remove</button>
                              </div>
                            ) : (
                              <label className="cursor-pointer">
                                <div className="text-2xl">📷</div>
                                <p className="mt-1 text-xs text-slate-400">Image {i + 1}</p>
                                <input type="file" accept="image/*" onChange={e => handleImageChange(i, e)} className="hidden" />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={submitting}
                      className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">
                      {submitting ? 'Submitting…' : '🎫 Submit Ticket'}
                    </button>
                    <button type="button" onClick={() => setTicketView('list')}
                      className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* ── Ticket list ──────────────────────────────────────────── */}
              {ticketView === 'list' && (
                <>
                  {/* Status filter */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${filterStatus === s ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {loadingTickets ? (
                    <p className="py-10 text-center text-slate-500">Loading your tickets…</p>
                  ) : filteredTickets.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 py-16 text-center">
                      <p className="text-4xl">🎫</p>
                      <p className="mt-3 text-lg font-bold text-slate-700">No tickets yet</p>
                      <p className="mt-1 text-sm text-slate-400">Click "Raise Ticket" to report a maintenance issue.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTickets.map(t => {
                        const sc = STATUS_COLORS[t.status] || STATUS_COLORS.OPEN
                        return (
                          <div key={t.id} onClick={() => openDetail(t)}
                            className="cursor-pointer rounded-2xl border border-slate-200 p-4 transition hover:border-slate-400 hover:shadow-md">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400">#{t.id}</p>
                                <p className="mt-0.5 font-bold text-slate-900">{t.title}</p>
                                <p className="mt-1 text-sm text-slate-500">📍 {t.resource} · 🏷 {t.category}</p>
                                <p className="mt-1 text-xs text-slate-400">{formatDate(t.createdAt)}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${sc.bg} ${sc.text}`}>{t.status.replace('_', ' ')}</span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{t.priority}</span>
                                <button
                                  onClick={(e) => handleDeleteMyTicket(e, t.id)}
                                  className="rounded-lg bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ── Ticket detail ─────────────────────────────────────────── */}
              {ticketView === 'detail' && selectedTicket && (
                <div className="space-y-4">
                  {/* Info */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-400">TICKET #{selectedTicket.id}</p>
                        <h2 className="mt-0.5 text-2xl font-black text-slate-900">{selectedTicket.title}</h2>
                        <p className="mt-1 text-sm text-slate-500">📍 {selectedTicket.resource} · 🏷 {selectedTicket.category} · ⬆ {selectedTicket.priority}</p>
                      </div>
                      {(() => {
                        const sc = STATUS_COLORS[selectedTicket.status] || STATUS_COLORS.OPEN
                        return <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${sc.bg} ${sc.text}`}>{selectedTicket.status.replace('_', ' ')}</span>
                      })()}
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-400">Description</p>
                      <p className="mt-1 text-sm text-slate-700">{selectedTicket.description}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500">
                      <p><span className="font-semibold text-slate-700">Assigned:</span> {selectedTicket.assignedToEmail || 'Unassigned'}</p>
                      <p><span className="font-semibold text-slate-700">Contact:</span> {selectedTicket.contactDetails || '—'}</p>
                      <p><span className="font-semibold text-slate-700">Created:</span> {formatDate(selectedTicket.createdAt)}</p>
                      <p><span className="font-semibold text-slate-700">Updated:</span> {formatDate(selectedTicket.updatedAt)}</p>
                    </div>

                    {selectedTicket.resolutionNotes && (
                      <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm">
                        <p className="font-bold uppercase text-green-600" style={{ fontSize: '0.7rem' }}>Resolution Notes</p>
                        <p className="mt-1 text-green-800">{selectedTicket.resolutionNotes}</p>
                      </div>
                    )}
                    {selectedTicket.rejectionReason && (
                      <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm">
                        <p className="font-bold uppercase text-red-500" style={{ fontSize: '0.7rem' }}>Rejection Reason</p>
                        <p className="mt-1 text-red-700">{selectedTicket.rejectionReason}</p>
                      </div>
                    )}

                    {/* Images */}
                    {(selectedTicket.imageUrl1 || selectedTicket.imageUrl2 || selectedTicket.imageUrl3) && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-bold uppercase text-slate-400">Attachments</p>
                        <div className="flex gap-2">
                          {[selectedTicket.imageUrl1, selectedTicket.imageUrl2, selectedTicket.imageUrl3].filter(Boolean).map((url, i) => (
                            <img key={i} src={url} alt={`Att ${i + 1}`} onClick={() => window.open(url, '_blank')}
                              className="h-20 w-28 cursor-pointer rounded-xl border border-slate-200 object-cover" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="mb-4 font-black text-slate-900">💬 Comments</h3>
                    <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                      {comments.length === 0 && <p className="text-sm text-slate-400">No comments yet.</p>}
                      {comments.map(c => {
                        const isOwn = c.authorEmail === user.email
                        return (
                          <div key={c.id} className={`rounded-xl border p-3 ${isOwn ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                            {editingCommentId === c.id ? (
                              <div>
                                <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} rows={2}
                                  className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                                <div className="flex gap-2">
                                  <button onClick={() => handleUpdateComment(c.id)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white">Save</button>
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
                        placeholder="Add a comment…" rows={2}
                        className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                      <button onClick={handleAddComment} className="rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">Post</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* ── Right Calendar sidebar (original, unchanged) ───────────────── */}
        <aside className="overflow-auto rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-black text-slate-900">Calendar</h2>
          <p className="mt-1 text-sm text-slate-500">Today</p>
          <div className="mt-6 space-y-4">
            {calendarItems.map((entry) => (
              <div key={`${entry.time}-${entry.title}`} className="rounded-xl border border-slate-200 p-3">
                <p className="text-lg font-black text-slate-900">{entry.time}</p>
                <p className="text-sm font-semibold text-slate-800">{entry.title}</p>
                <p className="text-xs text-slate-500">{entry.subtitle}</p>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
    </>
  )
}

export default Dashboard
