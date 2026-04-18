import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const NOTIFICATION_API_URL = `${API_BASE_URL}/api/auth/notification-preferences`
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

const Dashboard = () => {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [notificationPreferences, setNotificationPreferences] = useState({})
  const [notificationStatus, setNotificationStatus] = useState('')
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const [isNotificationSaving, setIsNotificationSaving] = useState(false)

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
    if (user?.email) {
      fetchNotificationPreferences()
    }
  }, [user?.email])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userItNumber = user.itNumber || user.itNo || localStorage.getItem('auth_it_number') || 'IT Number'

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

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  const handleOpenBookings = () => {
    navigate('/bookings')
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5efe8] p-2 sm:p-3 lg:p-4">
      <div className="grid h-full w-full gap-3 rounded-[2rem] bg-slate-50 p-3 shadow-2xl lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:p-4">
        <aside className="overflow-auto rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover shadow" />
            <div>
              <h2 className="text-2xl font-black text-slate-900">EduTrack</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">User Portal</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100 p-4">
            <p className="text-xs uppercase text-slate-500">Logged in as</p>
            <p className="mt-1 text-[1.85rem] font-bold leading-tight text-slate-900 break-words">{user.fullName || 'User'}</p>
            <p className="text-sm text-slate-600 break-all">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{user.role || 'USER'}</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm font-semibold text-slate-600">
            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-white">Dashboard</button>
            <button onClick={handleOpenBookings} className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">My Bookings</button>
            <button onClick={handleOpenBookings} className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">My Requests</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Notifications</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Profile</button>
          </nav>

          <button onClick={handleLogout} className="mt-10 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Logout
          </button>
        </aside>

        <main className="overflow-auto rounded-[1.5rem] bg-white p-6">
          <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="EduTrack logo" className="h-9 w-9 rounded-lg object-cover" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">University Operations</p>
                <p className="text-sm font-bold text-slate-800">Bookings, incidents, and audits in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Notifications</button>
              <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Quick Actions</button>
            </div>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Hello, {userItNumber}</h1>
              <p className="text-sm text-slate-500">Your bookings, requests, and status updates at a glance.</p>
            </div>
            <button onClick={handleOpenBookings} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Create Request</button>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Notification Preferences</h2>
                <p className="text-sm text-slate-500">Enable or disable categories for your account notifications.</p>
              </div>
              <button
                type="button"
                onClick={handleSaveNotificationPreferences}
                disabled={isNotificationSaving || isNotificationLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
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
        </main>

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
  )
}

export default Dashboard
