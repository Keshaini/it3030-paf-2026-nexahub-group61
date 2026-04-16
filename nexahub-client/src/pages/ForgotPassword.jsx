import { Link } from 'react-router-dom'
import { useState } from 'react'

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!email.trim()) {
      setError('Email is required.')
      setSuccessMessage('')
      return
    }

    if (!emailRegex.test(email.trim())) {
      setError('Use a valid email address.')
      setSuccessMessage('')
      return
    }

    setError('')
    setSuccessMessage('If your account exists, a password reset link has been sent.')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8">
          <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-900">
            Account Recovery
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900">Forgot Password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your email to receive a password reset link.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="resetEmail">
              Email Address
            </label>
            <input
              id="resetEmail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
                setSuccessMessage('')
              }}
              placeholder="name@smartcampus.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-orange-200 transition focus:ring-4"
              pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
              title="Use a valid email address"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}

          <button type="submit" className="water-button w-full rounded-2xl py-3 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110">
            Send Reset Link
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-bold text-blue-900 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
