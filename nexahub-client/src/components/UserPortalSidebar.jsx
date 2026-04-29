import { useNavigate } from 'react-router-dom'
import logo from '../assets/edutrack.png'
import { getDashboardPath } from '../auth/roles.js'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', path: (user) => getDashboardPath(user?.role) },
  { key: 'bookings', label: 'My Bookings', path: '/bookings' },
  { key: 'requests', label: 'My Requests', path: '/bookings' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'profile', label: 'Profile' },
]

const UserPortalSidebar = ({ user, activeItem = 'dashboard', onLogout }) => {
  const navigate = useNavigate()

  const handleNavigate = (item) => {
    if (!item.path) {
      return
    }

    const targetPath = typeof item.path === 'function' ? item.path(user) : item.path
    navigate(targetPath)
  }

  return (
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
        <p className="mt-1 break-words text-[1.85rem] font-bold leading-tight text-slate-900">{user?.fullName || 'User'}</p>
        <p className="break-all text-sm text-slate-600">{user?.email}</p>
        <p className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{user?.role || 'USER'}</p>
      </div>

      <nav className="mt-8 space-y-2 text-sm font-semibold text-slate-600">
        {navItems.map((item) => {
          const isActive = activeItem === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavigate(item)}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : item.path
                    ? 'hover:bg-slate-100'
                    : 'cursor-default text-slate-500'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-10 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      >
        Logout
      </button>
    </aside>
  )
}

export default UserPortalSidebar
