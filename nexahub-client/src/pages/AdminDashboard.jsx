import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'
import AdminPanelSidebar from '../components/AdminPanelSidebar.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const adminSections = ['Users', 'Resources', 'Bookings', 'Notifications']
const USERS_API_URL = `${API_BASE_URL}/api/auth/admin/users`
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
  const location = useLocation()
  const user = getAuthUser()
  const [activeSection, setActiveSection] = useState(location.state?.section || 'Users')
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
  const [deleteUserTarget, setDeleteUserTarget] = useState(null)

  const unreadNotificationCount = adminNotifications.filter((notification) => !notification.read).length

  const fetchUsers = async () => {
    setIsUsersLoading(true)
    setUsersStatus('')
    try {
      const response = await fetch(API_BASE_URL)
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
    const requestedSection = location.state?.section

    if (requestedSection && requestedSection !== activeSection && adminSections.includes(requestedSection)) {
      setActiveSection(requestedSection)
    }
  }, [location.state, activeSection])

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

  const handleOpenBookingReview = () => {
    navigate('/admin/bookings')
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
      const response = await fetch(`${API_BASE_URL}/${editingUserId}`, {
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

  const handleDeleteUser = (userToDelete) => {
    setCrudStatus('')
    setDeleteUserTarget(userToDelete)
  }

  const handleDeleteUserConfirm = async () => {
    if (!deleteUserTarget) {
      return
    }

    setCrudStatus('')

    try {
      const response = await fetch(`${API_BASE_URL}/${deleteUserTarget.id}`, {
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

      setCrudStatus(`User deleted: ${deleteUserTarget.email}`)
      if (editingUserId === deleteUserTarget.id) {
        handleCancelEdit()
      }
      setDeleteUserTarget(null)
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
              onClick={handleOpenBookingReview}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Review bookings
            </button>
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
          <AdminPanelSidebar
            user={user}
            activeItem={activeSection}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
          />

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

              {activeSection === 'Bookings' ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Booking approval, rejection, cancellation, and filtering are handled in the dedicated review console.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenBookingReview}
                    className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
                  >
                    Open booking review console
                  </button>
                </div>
              ) : null}
            </section>

          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteUserTarget)}
        title="Delete user account"
        description="Use delete only for accounts that should be removed completely. This action affects access across the system."
        confirmLabel="Delete user"
        confirmTone="danger"
        onClose={() => setDeleteUserTarget(null)}
        onConfirm={handleDeleteUserConfirm}
      >
        {deleteUserTarget ? (
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">{deleteUserTarget.fullName || 'Unnamed user'}</p>
            <p>{deleteUserTarget.email}</p>
            <p>{deleteUserTarget.role}</p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default AdminDashboard
