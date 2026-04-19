import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const adminSections = ['Users', 'Resources', 'Bookings', 'Notifications', 'Tickets']
const USERS_API_URL = `${API_BASE_URL}/api/auth/admin/users`
const TICKETS_URL = `${API_BASE_URL}/api/tickets`

const TICKET_STATUS_COLORS = {
  OPEN: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700' },
  RESOLVED: { bg: 'bg-green-100', text: 'text-green-700' },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-500' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
}
const TICKET_WORKFLOW = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

function fmtDate(dt) { return dt ? new Date(dt).toLocaleString() : '—' }
function tkHeaders(email, role) {
  return { 'Content-Type': 'application/json', 'X-User-Email': email, 'X-User-Role': role }
}
const NOTIFICATION_API_URL = `${API_BASE_URL}/api/auth/notification-preferences`
const notificationCategoryLabels = {
  BOOKING_UPDATES: 'Booking Updates',
  MAINTENANCE_ALERTS: 'Maintenance Alerts',
  SYSTEM_ANNOUNCEMENTS: 'System Announcements',
  SECURITY_NOTICES: 'Security Notices',
}

const initialAdminNotifications = [
  { id: 1, title: 'New booking request', detail: 'Computer Lab B needs approval.', time: '5 min ago', read: false },
  { id: 2, title: 'Maintenance alert', detail: 'Projector fault reported in Hall A3.', time: '20 min ago', read: false },
  { id: 3, title: 'System announcement', detail: 'Semester schedule update published.', time: '1 hour ago', read: true },
]


// Admin Dashboard

const AdminDashboard = () => {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [activeSection, setActiveSection] = useState('Users')
  const [users, setUsers] = useState([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [usersStatus, setUsersStatus] = useState('')
  const [crudStatus, setCrudStatus] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    itNumber: '',
    email: '',
    role: 'USER',
  })
  const [formData, setFormData] = useState({
    fullName: '',
    itNumber: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState({})
  const [notificationStatus, setNotificationStatus] = useState('')
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const [isNotificationSaving, setIsNotificationSaving] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [adminNotifications, setAdminNotifications] = useState(initialAdminNotifications)

  // ── Ticket state ──────────────────────────────────────────────────────
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [ticketMsg, setTicketMsg] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketStatusForm, setTicketStatusForm] = useState({ status: '', rejectionReason: '', resolutionNotes: '', assignedToEmail: '' })
  const [updatingTicket, setUpdatingTicket] = useState(false)
  const [ticketFilterStatus, setTicketFilterStatus] = useState('ALL')
  const [ticketComments, setTicketComments] = useState([])
  const [ticketCommentText, setTicketCommentText] = useState('')
  const [editingTicketCommentId, setEditingTicketCommentId] = useState(null)
  const [editingTicketCommentText, setEditingTicketCommentText] = useState('')

  const unreadNotificationCount = adminNotifications.filter((notification) => !notification.read).length

  const fetchUsers = async () => {
    setIsUsersLoading(true)
    setUsersStatus('')
    try {
      const response = await fetch(USERS_API_URL)
      const data = await response.json()

      if (!response.ok) {
        setUsersStatus(data.message || 'Failed to load users.')
        return
      }

      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setUsersStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsUsersLoading(false)
    }
  }

  const fetchNotificationPreferences = async () => {
    if (!user?.email) {
      return
    }

    setIsNotificationLoading(true)
    setNotificationStatus('')
    try {
      const response = await fetch(`${NOTIFICATION_API_URL}?email=${encodeURIComponent(user.email)}`)
      const data = await response.json()

      if (!response.ok) {
        setNotificationStatus(data.message || 'Failed to load notification preferences.')
        return
      }

      setNotificationPreferences(data.preferences || {})
    } catch {
      setNotificationStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsNotificationLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'Users') {
      fetchUsers()
    }
  }, [activeSection])

  useEffect(() => {
    if (activeSection === 'Notifications') {
      fetchNotificationPreferences()
    }
  }, [activeSection, user?.email])

  useEffect(() => {
    if (activeSection === 'Tickets') fetchAllTickets()
  }, [activeSection])

  async function fetchAllTickets() {
    setLoadingTickets(true); setTicketMsg('')
    try {
      const res = await fetch(TICKETS_URL, { headers: tkHeaders(user.email, user.role) })
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch { setTicketMsg('Cannot connect to server.') }
    finally { setLoadingTickets(false) }
  }

  async function fetchTicketComments(ticketId) {
    try {
      const res = await fetch(`${TICKETS_URL}/${ticketId}/comments`, { headers: tkHeaders(user.email, user.role) })
      const data = await res.json()
      setTicketComments(Array.isArray(data) ? data : [])
    } catch { setTicketComments([]) }
  }

  function openTicketDetail(ticket) {
    setSelectedTicket(ticket)
    setTicketStatusForm({ status: ticket.status, rejectionReason: '', resolutionNotes: ticket.resolutionNotes || '', assignedToEmail: ticket.assignedToEmail || '' })
    setTicketMsg('')
    setTicketCommentText('')
    setEditingTicketCommentId(null)
    fetchTicketComments(ticket.id)
  }

  async function handleUpdateTicketStatus(e) {
    e.preventDefault()
    setUpdatingTicket(true); setTicketMsg('')
    try {
      const res = await fetch(`${TICKETS_URL}/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: tkHeaders(user.email, user.role),
        body: JSON.stringify(ticketStatusForm),
      })
      const data = await res.json()
      if (!res.ok) { setTicketMsg(data.message || 'Failed to update.'); return }
      setTicketMsg(`Status updated to ${data.status}`)
      setSelectedTicket(data)
      setTickets(prev => prev.map(t => t.id === data.id ? data : t))
    } catch { setTicketMsg('Cannot connect to server.') }
    finally { setUpdatingTicket(false) }
  }

  async function handleDeleteTicket(id) {
    if (!window.confirm('Permanently delete this ticket and all its comments?')) return
    try {
      await fetch(`${TICKETS_URL}/${id}`, { method: 'DELETE', headers: tkHeaders(user.email, user.role) })
      setSelectedTicket(null)
      fetchAllTickets()
    } catch { setTicketMsg('Failed to delete ticket.') }
  }

  async function handleAddTicketComment() {
    if (!ticketCommentText.trim()) return
    try {
      const res = await fetch(`${TICKETS_URL}/${selectedTicket.id}/comments`, {
        method: 'POST', headers: tkHeaders(user.email, user.role),
        body: JSON.stringify({ content: ticketCommentText }),
      })
      if (res.ok) { setTicketCommentText(''); fetchTicketComments(selectedTicket.id) }
    } catch { /* silent */ }
  }

  async function handleUpdateTicketComment(id) {
    if (!editingTicketCommentText.trim()) return
    try {
      const res = await fetch(`${TICKETS_URL}/comments/${id}`, {
        method: 'PUT', headers: tkHeaders(user.email, user.role),
        body: JSON.stringify({ content: editingTicketCommentText }),
      })
      if (res.ok) { setEditingTicketCommentId(null); fetchTicketComments(selectedTicket.id) }
    } catch { /* silent */ }
  }

  async function handleDeleteTicketComment(id) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await fetch(`${TICKETS_URL}/comments/${id}`, { method: 'DELETE', headers: tkHeaders(user.email, user.role) })
      fetchTicketComments(selectedTicket.id)
    } catch { /* silent */ }
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login', { replace: true })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'itNumber' ? value.toUpperCase().replace(/\s+/g, '') : value,
    }))
  }

  const isStudentCreate = formData.role === 'STUDENT'

  const handleCreateAccount = async (event) => {
    event.preventDefault()
    setStatusMessage('')
    setIsSubmitting(true)

    const payload = {
      itNumber: formData.itNumber.trim().toUpperCase(),
      role: formData.role,
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    }

    if (isStudentCreate) {
      payload.fullName = formData.fullName.trim() || null
      payload.email = formData.email.trim().toLowerCase() || null
      payload.password = formData.password.trim() || null
    }

    try {
      const response = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        setStatusMessage(data.message || 'Account creation failed.')
        return
      }

      const studentHint = isStudentCreate && !formData.password.trim()
        ? ' Default password is IT number + @Stu.'
        : ''
      setStatusMessage(`${data.role} account created for ${data.email}.${studentHint}`)
      setCrudStatus('User account created successfully.')
      setFormData({
        fullName: '',
        itNumber: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
      })
      fetchUsers()
    } catch {
      setStatusMessage('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditInputChange = (event) => {
    const { name, value } = event.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'itNumber' ? value.toUpperCase().replace(/\s+/g, '') : value,
    }))
  }

  const handleStartEdit = (selectedUser) => {
    setEditingUserId(selectedUser.id)
    setCrudStatus('')
    setEditFormData({
      fullName: selectedUser.fullName || '',
      itNumber: selectedUser.itNumber || '',
      email: selectedUser.email || '',
      role: selectedUser.role || 'USER',
    })
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditFormData({
      fullName: '',
      itNumber: '',
      email: '',
      role: 'USER',
    })
  }

  const handleUpdateUser = async (event) => {
    event.preventDefault()
    if (!editingUserId) {
      return
    }

    setCrudStatus('')
    setIsUpdatingUser(true)

    try {
      const response = await fetch(`${USERS_API_URL}/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFormData.fullName.trim(),
          itNumber: editFormData.itNumber.trim().toUpperCase(),
          email: editFormData.email.trim().toLowerCase(),
          role: editFormData.role,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setCrudStatus(data.message || 'Failed to update user.')
        return
      }

      setCrudStatus(`User updated: ${data.email}`)
      setEditingUserId(null)
      fetchUsers()
    } catch {
      setCrudStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleDeleteUser = async (userToDelete) => {
    const isConfirmed = window.confirm(`Delete user ${userToDelete.email}?`)
    if (!isConfirmed) {
      return
    }

    setCrudStatus('')

    try {
      const response = await fetch(`${USERS_API_URL}/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let message = 'Failed to delete user.'
        try {
          const data = await response.json()
          message = data.message || message
        } catch {
          // Keep default message when response body is empty.
        }
        setCrudStatus(message)
        return
      }

      setCrudStatus(`User deleted: ${userToDelete.email}`)
      if (editingUserId === userToDelete.id) {
        handleCancelEdit()
      }
      fetchUsers()
    } catch {
      setCrudStatus('Cannot connect to server. Please start backend and try again.')
    }
  }

  const handleNotificationToggle = (category) => {
    setNotificationStatus('')
    setNotificationPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleSaveNotificationPreferences = async () => {
    if (!user?.email) {
      return
    }

    setIsNotificationSaving(true)
    setNotificationStatus('')

    try {
      const response = await fetch(NOTIFICATION_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          preferences: notificationPreferences,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setNotificationStatus(data.message || 'Failed to save notification preferences.')
        return
      }

      setNotificationPreferences(data.preferences || {})
      setNotificationStatus('Notification preferences saved.')
    } catch {
      setNotificationStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsNotificationSaving(false)
    }
  }

  const handleMarkAllNotificationsRead = () => {
    setAdminNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const handleReadNotificationMessage = (notificationId) => {
    setAdminNotifications((prev) => prev.map((notification) => (
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )))
  }

  return (
    <div className="min-h-screen bg-[#f5efe8] p-3 sm:p-5">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-xl sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin Control Room</p>
              <h1 className="text-2xl font-black text-slate-900">Campus Operations Dashboard</h1>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNotificationPanelOpen((prev) => !prev)}
              className="relative rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              aria-label="View notifications"
            >
              <span className="text-base leading-none">🔔</span>
              {unreadNotificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                  {unreadNotificationCount}
                </span>
              ) : null}
            </button>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">ADMIN</span>
            <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Logout
            </button>

            {isNotificationPanelOpen ? (
              <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Notifications</p>
                    <h3 className="text-lg font-black text-slate-900">Recent updates</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNotificationPanelOpen(false)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {adminNotifications.map((notification) => (
                    <div key={notification.id} className={`rounded-xl border p-3 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-cyan-200 bg-cyan-50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-bold ${notification.read ? 'text-slate-900' : 'text-cyan-900'}`}>{notification.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
                          <button
                            type="button"
                            onClick={() => handleReadNotificationMessage(notification.id)}
                            disabled={notification.read}
                            className="mt-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {notification.read ? 'Read' : 'Read message'}
                          </button>
                        </div>
                        <span className="whitespace-nowrap text-xs font-semibold text-slate-400">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Navigation</p>
            <nav className="mt-4 space-y-2">
              {adminSections.map((section) => {
                const isActive = activeSection === section
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => {
                      setActiveSection(section)
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {section === 'Tickets' ? '🎫 ' : ''}{section}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-black text-slate-900">{activeSection}</h2>
              <p className="mt-2 text-sm text-slate-500">
                You are signed in as {user.fullName || 'Administrator'} ({user.email}).
              </p>

              {activeSection === 'Users' ? (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">Manage all users in the system (Read, Create, Update, Delete).</p>
                    <button
                      type="button"
                      onClick={fetchUsers}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Refresh Users
                    </button>
                  </div>

                  {usersStatus ? <p className="text-sm text-rose-600">{usersStatus}</p> : null}
                  {crudStatus ? <p className="text-sm text-slate-700">{crudStatus}</p> : null}

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full bg-white text-sm">
                      <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">IT Number</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Role</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isUsersLoading ? (
                          <tr>
                            <td colSpan="5" className="px-3 py-5 text-center text-slate-500">Loading users...</td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-3 py-5 text-center text-slate-500">No users found.</td>
                          </tr>
                        ) : (
                          users.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                              <td className="px-3 py-2 text-slate-800">{item.fullName}</td>
                              <td className="px-3 py-2 text-slate-700">{item.itNumber}</td>
                              <td className="px-3 py-2 text-slate-700">{item.email}</td>
                              <td className="px-3 py-2 text-slate-700">{item.role}</td>
                              <td className="px-3 py-2">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(item)}
                                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {editingUserId ? (
                    <form className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2" onSubmit={handleUpdateUser}>
                      <input
                        name="fullName"
                        value={editFormData.fullName}
                        onChange={handleEditInputChange}
                        placeholder="Full name"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required
                      />
                      <input
                        name="itNumber"
                        value={editFormData.itNumber}
                        onChange={handleEditInputChange}
                        placeholder="IT23608054"
                        maxLength={10}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 uppercase outline-none focus:ring-4 focus:ring-violet-100"
                        required
                      />
                      <input
                        name="email"
                        type="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        placeholder="user@smartcampus.com"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required
                      />
                      <select
                        name="role"
                        value={editFormData.role}
                        onChange={handleEditInputChange}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="USER">USER</option>
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <div className="flex gap-2 md:col-span-2">
                        <button
                          type="submit"
                          disabled={isUpdatingUser}
                          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {isUpdatingUser ? 'Updating...' : 'Update User'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Create User Account</h2>
                        <p className="text-sm text-slate-500">Admin can create ADMIN, MANAGER, TECHNICIAN, USER, and STUDENT accounts.</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">STUDENT uses IT number, TECHNICIAN gets ITTECH###</span>
                    </div>

                    <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateAccount}>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'Optional for student' : 'Full name'}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required={!isStudentCreate}
                      />
                      <input
                        name="itNumber"
                        value={formData.itNumber}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'IT23608054' : 'Optional for technician (auto ITTECH001)'}
                        maxLength={10}
                        className="rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:ring-4 focus:ring-violet-100"
                        required={isStudentCreate}
                      />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'Optional for student' : 'staff@smartcampus.com'}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required={!isStudentCreate}
                      />
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'Optional for student (auto if empty)' : 'Temporary password'}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required={!isStudentCreate}
                      />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                        <option value="STUDENT">STUDENT</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60"
                      >
                        {isSubmitting ? 'Creating...' : 'Create Account'}
                      </button>
                    </form>

                    {statusMessage ? <p className="mt-3 text-sm text-slate-600">{statusMessage}</p> : null}
                  </section>
                </div>
              ) : null}

              {activeSection === 'Notifications' ? (
                <div className="mt-5 space-y-4">
                  <p className="text-sm text-slate-500">Enable or disable notification categories for your admin account.</p>
                  {notificationStatus ? <p className="text-sm text-slate-700">{notificationStatus}</p> : null}

                  {isNotificationLoading ? (
                    <p className="text-sm text-slate-500">Loading notification preferences...</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.keys(notificationCategoryLabels).map((category) => {
                        const isEnabled = Boolean(notificationPreferences[category])
                        return (
                          <label key={category} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                            <span className="font-semibold text-slate-800">{notificationCategoryLabels[category]}</span>
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleNotificationToggle(category)}
                              className="h-5 w-5 accent-slate-900"
                            />
                          </label>
                        )
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveNotificationPreferences}
                    disabled={isNotificationSaving || isNotificationLoading}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {isNotificationSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              ) : null}

              {activeSection === 'Tickets' ? (
                <div className="mt-5">
                  {/* Stats row */}
                  <div className="mb-4 grid grid-cols-4 gap-3">
                    {[
                      { label: 'Total', value: tickets.length, color: 'text-slate-900' },
                      { label: 'Open', value: tickets.filter(t => t.status === 'OPEN').length, color: 'text-blue-700' },
                      { label: 'In Progress', value: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-amber-700' },
                      { label: 'Resolved', value: tickets.filter(t => t.status === 'RESOLVED').length, color: 'text-green-700' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Filter + refresh */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
                      <button key={s} onClick={() => setTicketFilterStatus(s)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          ticketFilterStatus === s ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                    <button onClick={fetchAllTickets} className="ml-auto rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">↻ Refresh</button>
                  </div>

                  {ticketMsg && <p className={`mb-3 text-sm font-semibold ${ticketMsg.includes('updated') || ticketMsg.includes('deleted') ? 'text-green-600' : 'text-red-600'}`}>{ticketMsg}</p>}

                  {loadingTickets ? (
                    <p className="py-10 text-center text-slate-500">Loading tickets…</p>
                  ) : (
                    <div className={`grid gap-5 ${selectedTicket ? 'lg:grid-cols-[1fr_1.5fr]' : ''}`}>

                      {/* Ticket list */}
                      <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                        {(ticketFilterStatus === 'ALL' ? tickets : tickets.filter(t => t.status === ticketFilterStatus)).length === 0 && (
                          <p className="py-8 text-center text-slate-400">No tickets found.</p>
                        )}
                        {(ticketFilterStatus === 'ALL' ? tickets : tickets.filter(t => t.status === ticketFilterStatus)).map(t => {
                          const sc = TICKET_STATUS_COLORS[t.status] || TICKET_STATUS_COLORS.OPEN
                          const isSelected = selectedTicket?.id === t.id
                          return (
                            <div key={t.id} onClick={() => openTicketDetail(t)}
                              className={`cursor-pointer rounded-2xl border p-4 transition hover:shadow-md ${
                                isSelected ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-white'
                              }`}>
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-slate-400">#{t.id}</p>
                                  <p className="mt-0.5 font-bold text-slate-900">{t.title}</p>
                                  <p className="mt-1 text-xs text-slate-500">📍 {t.resource} · 🏷 {t.category}</p>
                                  <p className="mt-0.5 text-xs text-slate-400">👤 {t.reporterEmail}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${sc.bg} ${sc.text}`}>{t.status.replace('_', ' ')}</span>
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
                          <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-slate-400">TICKET #{selectedTicket.id}</p>
                                <h3 className="mt-0.5 text-xl font-black text-slate-900">{selectedTicket.title}</h3>
                                <p className="mt-1 text-sm text-slate-500">📍 {selectedTicket.resource} · 🏷 {selectedTicket.category} · ⬆ {selectedTicket.priority}</p>
                              </div>
                              <div className="flex gap-2">
                                {(() => { const sc = TICKET_STATUS_COLORS[selectedTicket.status] || TICKET_STATUS_COLORS.OPEN; return <span className={`rounded-full px-3 py-1 text-sm font-bold ${sc.bg} ${sc.text}`}>{selectedTicket.status.replace('_', ' ')}</span> })()}
                                <button onClick={() => handleDeleteTicket(selectedTicket.id)} className="rounded-xl bg-red-100 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-200">Delete</button>
                              </div>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3 text-sm">
                              <p className="text-xs font-bold uppercase text-slate-400">Description</p>
                              <p className="mt-1 text-slate-700">{selectedTicket.description}</p>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500">
                              <p><b className="text-slate-700">Reporter:</b> {selectedTicket.reporterEmail}</p>
                              <p><b className="text-slate-700">Assigned:</b> {selectedTicket.assignedToEmail || 'Unassigned'}</p>
                              <p><b className="text-slate-700">Contact:</b> {selectedTicket.contactDetails || '—'}</p>
                              <p><b className="text-slate-700">Created:</b> {fmtDate(selectedTicket.createdAt)}</p>
                            </div>

                            {selectedTicket.resolutionNotes && (
                              <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm">
                                <p className="font-bold uppercase text-green-600" style={{fontSize:'0.7rem'}}>Resolution Notes</p>
                                <p className="mt-1 text-green-800">{selectedTicket.resolutionNotes}</p>
                              </div>
                            )}
                            {selectedTicket.rejectionReason && (
                              <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm">
                                <p className="font-bold uppercase text-red-500" style={{fontSize:'0.7rem'}}>Rejection Reason</p>
                                <p className="mt-1 text-red-700">{selectedTicket.rejectionReason}</p>
                              </div>
                            )}

                            {(selectedTicket.imageUrl1 || selectedTicket.imageUrl2 || selectedTicket.imageUrl3) && (
                              <div className="mt-3">
                                <p className="mb-2 text-xs font-bold uppercase text-slate-400">Attachments</p>
                                <div className="flex gap-2">
                                  {[selectedTicket.imageUrl1, selectedTicket.imageUrl2, selectedTicket.imageUrl3].filter(Boolean).map((url, i) => (
                                    <img key={i} src={url} alt={`Att${i+1}`} onClick={() => window.open(url,'_blank')}
                                      className="h-16 w-24 cursor-pointer rounded-xl border border-slate-200 object-cover" />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status update */}
                          <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <h4 className="mb-3 font-black text-slate-900">Update Status</h4>
                            <form onSubmit={handleUpdateTicketStatus} className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {TICKET_WORKFLOW.map((s, idx) => (
                                  <button key={s} type="button" onClick={() => setTicketStatusForm(f => ({...f, status: s}))}
                                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                                      ticketStatusForm.status === s ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}>
                                    {idx > 0 && <span className="mr-1 opacity-40">→</span>}{s.replace('_',' ')}
                                  </button>
                                ))}
                                <button type="button" onClick={() => setTicketStatusForm(f => ({...f, status: 'REJECTED'}))}
                                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                                    ticketStatusForm.status === 'REJECTED' ? 'bg-red-600 text-white' : 'border border-red-200 text-red-600 hover:bg-red-50'
                                  }`}>✕ REJECT</button>
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Assign To (email)</label>
                                <input value={ticketStatusForm.assignedToEmail} onChange={e => setTicketStatusForm(f=>({...f, assignedToEmail: e.target.value}))}
                                  placeholder="technician@smartcampus.com"
                                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Resolution Notes</label>
                                <textarea value={ticketStatusForm.resolutionNotes} onChange={e => setTicketStatusForm(f=>({...f, resolutionNotes:e.target.value}))}
                                  rows={2} placeholder="Describe resolution steps…"
                                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                              </div>

                              {ticketStatusForm.status === 'REJECTED' && (
                                <div>
                                  <label className="mb-1 block text-xs font-bold uppercase text-red-500">Rejection Reason *</label>
                                  <textarea required value={ticketStatusForm.rejectionReason} onChange={e => setTicketStatusForm(f=>({...f, rejectionReason:e.target.value}))}
                                    rows={2} placeholder="Reason for rejection…"
                                    className="w-full resize-none rounded-xl border border-red-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200" />
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                <button type="submit" disabled={updatingTicket}
                                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">
                                  {updatingTicket ? 'Saving…' : '✓ Save Update'}
                                </button>
                                {ticketMsg && <p className={`text-sm font-semibold ${ticketMsg.includes('updated') ? 'text-green-600' : 'text-red-600'}`}>{ticketMsg}</p>}
                              </div>
                            </form>
                          </div>

                          {/* Comments */}
                          <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <h4 className="mb-4 font-black text-slate-900">💬 Comments</h4>
                            <div className="mb-4 max-h-48 space-y-3 overflow-y-auto">
                              {ticketComments.length === 0 && <p className="text-sm text-slate-400">No comments yet.</p>}
                              {ticketComments.map(c => {
                                const isOwn = c.authorEmail === user.email
                                return (
                                  <div key={c.id} className={`rounded-xl border p-3 ${isOwn ? 'border-slate-300 bg-slate-50' : 'border-slate-200'}`}>
                                    {editingTicketCommentId === c.id ? (
                                      <div>
                                        <textarea value={editingTicketCommentText} onChange={e=>setEditingTicketCommentText(e.target.value)} rows={2}
                                          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                                        <div className="flex gap-2">
                                          <button onClick={() => handleUpdateTicketComment(c.id)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white">Save</button>
                                          <button onClick={() => setEditingTicketCommentId(null)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Cancel</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="mb-1 flex justify-between">
                                          <span className="text-xs font-bold text-slate-600">{c.authorEmail} <span className="font-normal text-slate-400">({c.authorRole})</span></span>
                                          <span className="text-xs text-slate-400">{fmtDate(c.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-slate-700">{c.content}</p>
                                        <div className="mt-2 flex gap-2">
                                          {isOwn && <button onClick={() => {setEditingTicketCommentId(c.id); setEditingTicketCommentText(c.content)}} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white">Edit</button>}
                                          <button onClick={() => handleDeleteTicketComment(c.id)} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white">Delete</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            <div className="flex gap-3">
                              <textarea value={ticketCommentText} onChange={e=>setTicketCommentText(e.target.value)}
                                placeholder="Add a comment…" rows={2}
                                className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                              <button onClick={handleAddTicketComment} className="rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">Post</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </section>

          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard