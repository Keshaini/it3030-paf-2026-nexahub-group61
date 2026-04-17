import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getDashboardPath, normalizeRole } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const extractErrorMessage = (payload, fallbackMessage) => {
    if (payload?.errors && typeof payload.errors === 'object') {
      const firstFieldError = Object.values(payload.errors)[0]
      if (typeof firstFieldError === 'string' && firstFieldError.trim()) {
        return firstFieldError
      }
    }

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message
    }

    return fallbackMessage
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitMessage('')

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setSubmitMessage(extractErrorMessage(data, 'Login failed. Please check your credentials.'))
        return
      }

      const fallbackItNumber = localStorage.getItem('auth_it_number')
      const resolvedItNumber = data.itNumber || data.itNo || fallbackItNumber || 'IT Number'
      const normalizedRole = normalizeRole(data.role)

      localStorage.setItem('auth_user', JSON.stringify({
        email: data.email,
        itNumber: resolvedItNumber,
        itNo: resolvedItNumber,
        fullName: data.fullName,
        role: normalizedRole,
      }))

      if (resolvedItNumber && resolvedItNumber !== 'IT Number') {
        localStorage.setItem('auth_it_number', resolvedItNumber)
      }
      const targetPath = getDashboardPath(normalizedRole)
      navigate(targetPath, { replace: true })
    } catch {
      setSubmitMessage('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <div className="flex flex-1 overflow-hidden">
      <div className="relative hidden w-1/2 overflow-hidden bg-orange-100 lg:flex">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-orange-300/60 blur-3xl"></div>
        <div className="absolute -bottom-24 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-300/50 blur-3xl"></div>

        <div className="relative z-10 m-10 flex w-full flex-col justify-between rounded-[2.5rem] border border-white/40 bg-white/45 p-10 backdrop-blur-sm">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-900">
              Smart Campus Operations
            </p>
            <h2 className="max-w-sm text-4xl font-extrabold leading-tight text-slate-900">
              Book rooms and assets, track incidents, and close maintenance faster.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              One platform for requests, approvals, technician updates, and verified resolutions with full audit history.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Bookings today</p>
              <p className="mt-2 text-2xl font-extrabold text-blue-900">426</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Open incidents</p>
              <p className="mt-2 text-2xl font-extrabold text-orange-500">38</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-500">Login to continue to your smart campus account.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@smartcampus.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-orange-200 transition focus:ring-4"
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-900 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 ring-orange-200 transition focus-within:ring-4">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-slate-900 outline-none"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-900" />
                Remember me
              </label>
              <span className="font-semibold text-slate-500">Secure login</span>
            </div>

            <button disabled={isSubmitting} className="water-button w-full rounded-2xl py-3 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110">
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {submitMessage ? <p className="text-sm text-red-500">{submitMessage}</p> : null}
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            New to EduTrack?{' '}
            <Link to="/signup" className="font-bold text-orange-600 hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Login
