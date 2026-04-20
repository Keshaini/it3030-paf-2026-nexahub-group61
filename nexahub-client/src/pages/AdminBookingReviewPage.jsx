import { Navigate, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'
import { approveBooking, cancelBooking, deleteBookingAsAdmin, fetchAllBookings, fetchResources, rejectBooking } from '../bookings/api.js'
import { formatBookingDate, formatDateTime, formatTimeRange } from '../bookings/format.js'
import { bookingStatusOptions } from '../bookings/status.js'
import AdminPanelSidebar from '../components/AdminPanelSidebar.jsx'
import BookingStatusBadge from '../components/BookingStatusBadge.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ReasonDialog from '../components/ReasonDialog.jsx'

const AdminBookingReviewPage = () => {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    resourceId: '',
    bookingDate: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [actionKey, setActionKey] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadResources = async () => {
    try {
      const data = await fetchResources()
      setResources(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatusMessage(error.message || 'Failed to load resources.')
    }
  }

  const loadBookings = async () => {
    if (!user?.email) {
      return
    }

    setIsLoading(true)
    setStatusMessage('')

    try {
      const data = await fetchAllBookings(user.email, filters)
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatusMessage(error.message || 'Failed to load booking requests.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    loadBookings()
  }, [user?.email, filters.status, filters.resourceId, filters.bookingDate])

  const metrics = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'PENDING').length,
    approved: bookings.filter((booking) => booking.status === 'APPROVED').length,
    rejected: bookings.filter((booking) => booking.status === 'REJECTED').length,
  }), [bookings])

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

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApprove = async (bookingId) => {
    setActionKey(`approve-${bookingId}`)
    setStatusMessage('')

    try {
      await approveBooking(bookingId, user.email)
      setStatusMessage('Booking approved.')
      await loadBookings()
    } catch (error) {
      setStatusMessage(error.message || 'Approval failed.')
    } finally {
      setActionKey('')
    }
  }

  const handleReject = (booking) => {
    setStatusMessage('')
    setRejectTarget(booking)
  }

  const handleRejectSubmit = async (reason) => {
    if (!rejectTarget) {
      return
    }

    setActionKey(`reject-${rejectTarget.id}`)
    setStatusMessage('')

    try {
      await rejectBooking(rejectTarget.id, user.email, reason)
      setRejectTarget(null)
      setStatusMessage('Booking rejected.')
      await loadBookings()
    } catch (error) {
      setStatusMessage(error.message || 'Rejection failed.')
    } finally {
      setActionKey('')
    }
  }

  const handleCancel = (booking) => {
    setStatusMessage('')
    setCancelTarget(booking)
  }

  const handleCancelSubmit = async (reason) => {
    if (!cancelTarget) {
      return
    }

    setActionKey(`cancel-${cancelTarget.id}`)
    setStatusMessage('')

    try {
      await cancelBooking(cancelTarget.id, user.email, reason)
      setCancelTarget(null)
      setStatusMessage('Booking cancelled.')
      await loadBookings()
    } catch (error) {
      setStatusMessage(error.message || 'Cancellation failed.')
    } finally {
      setActionKey('')
    }
  }

  const handleDelete = (booking) => {
    setStatusMessage('')
    setDeleteTarget(booking)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return
    }

    setActionKey(`delete-${deleteTarget.id}`)
    setStatusMessage('')

    try {
      await deleteBookingAsAdmin(deleteTarget.id, user.email)
      setDeleteTarget(null)
      setStatusMessage('Booking deleted from the database.')
      await loadBookings()
    } catch (error) {
      setStatusMessage(error.message || 'Delete failed.')
    } finally {
      setActionKey('')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fff7ed_28%,#eff6ff_100%)] p-3 sm:p-5">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-2xl backdrop-blur sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <AdminPanelSidebar user={user} activeItem="Bookings" onLogout={handleLogout} />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <img src={logo} alt="EduTrack logo" className="h-11 w-11 rounded-2xl object-cover shadow" />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Admin Review</p>
                  <h1 className="text-3xl font-black text-slate-900">Booking Approval Console</h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadBookings}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                >
                  Refresh requests
                </button>
              </div>
            </div>

            <section className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total requests', value: metrics.total, tone: 'from-slate-100 to-slate-50 text-slate-900' },
            { label: 'Pending', value: metrics.pending, tone: 'from-amber-200 to-amber-50 text-amber-900' },
            { label: 'Approved', value: metrics.approved, tone: 'from-emerald-200 to-emerald-50 text-emerald-900' },
            { label: 'Rejected', value: metrics.rejected, tone: 'from-rose-200 to-rose-50 text-rose-900' },
          ].map((card) => (
            <article key={card.label} className={`rounded-[1.6rem] border border-white/70 bg-gradient-to-br ${card.tone} p-5 shadow-sm`}>
              <p className="text-xs uppercase tracking-[0.22em]">{card.label}</p>
              <p className="mt-3 text-4xl font-black">{card.value}</p>
            </article>
          ))}
            </section>

            <section className="mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Filters</p>
              <h2 className="text-2xl font-black text-slate-900">Review booking requests</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-amber-100"
              >
                {bookingStatusOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="resourceId"
                value={filters.resourceId}
                onChange={handleFilterChange}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-amber-100"
              >
                <option value="">All resources</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>
              <input
                name="bookingDate"
                type="date"
                value={filters.bookingDate}
                onChange={handleFilterChange}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          {statusMessage ? <p className="mt-4 text-sm text-slate-700">{statusMessage}</p> : null}
          {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading booking requests...</p> : null}

          {!isLoading && bookings.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No booking requests matched the selected filters.
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            {bookings.map((booking) => {
              const approveKey = `approve-${booking.id}`
              const rejectKey = `reject-${booking.id}`
              const cancelKey = `cancel-${booking.id}`
              const deleteKey = `delete-${booking.id}`

              return (
                <article key={booking.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900">{booking.resourceName}</h3>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{booking.resourceCode} - {booking.resourceCategory} - {booking.resourceLocation}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>{booking.requesterName}</p>
                      <p>{booking.requesterEmail}</p>
                      <p>{booking.requesterItNumber}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Requested slot</p>
                      <p className="mt-2 font-bold text-slate-900">{formatBookingDate(booking.bookingDate)}</p>
                      <p className="text-sm text-slate-600">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Attendees</p>
                      <p className="mt-2 font-bold text-slate-900">{booking.expectedAttendees}</p>
                      <p className="text-sm text-slate-600">Capacity {booking.resourceCapacity}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
                      <p className="mt-2 font-bold text-slate-900">{formatDateTime(booking.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Reviewed by</p>
                      <p className="mt-2 font-bold text-slate-900">{booking.reviewedByName || 'Pending review'}</p>
                      <p className="text-sm text-slate-600">{booking.reviewedAt ? formatDateTime(booking.reviewedAt) : 'No review timestamp yet'}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Purpose</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{booking.purpose}</p>

                    {booking.rejectionReason ? (
                      <p className="mt-3 text-sm text-rose-700">Rejection reason: {booking.rejectionReason}</p>
                    ) : null}

                    {booking.cancellationReason ? (
                      <p className="mt-3 text-sm text-slate-700">Cancellation note: {booking.cancellationReason}</p>
                    ) : null}

                    {booking.requesterArchived ? (
                      <p className="mt-3 text-sm font-medium text-amber-700">Requester removed this booking from their history. Delete it here to remove it from the database.</p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {booking.status === 'PENDING' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(booking.id)}
                          disabled={actionKey === approveKey}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                          {actionKey === approveKey ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(booking)}
                          disabled={actionKey === rejectKey}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-60"
                        >
                          {actionKey === rejectKey ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    ) : null}

                    {['PENDING', 'APPROVED'].includes(booking.status) ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking)}
                        disabled={actionKey === cancelKey}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                      >
                        {actionKey === cancelKey ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : null}

                    {['PENDING', 'REJECTED', 'CANCELLED'].includes(booking.status) ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(booking)}
                        disabled={actionKey === deleteKey}
                        className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      >
                        {actionKey === deleteKey ? 'Deleting...' : 'Delete permanently'}
                      </button>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
            </section>
          </div>
        </div>
      </div>

      <ReasonDialog
        isOpen={Boolean(rejectTarget)}
        title="Reject booking request"
        description="Give the requester a clear reason so they can correct the request instead of guessing what failed."
        label="Rejection reason"
        placeholder="Example: The lab is reserved for an exam during this slot."
        helperText="Required. The requester will see this in their booking history."
        initialValue={rejectTarget?.rejectionReason || ''}
        confirmLabel={actionKey === `reject-${rejectTarget?.id}` ? 'Rejecting...' : 'Reject booking'}
        confirmTone="danger"
        isBusy={Boolean(rejectTarget) && actionKey === `reject-${rejectTarget?.id}`}
        required
        onClose={() => {
          if (!actionKey.startsWith('reject-')) {
            setRejectTarget(null)
          }
        }}
        onSubmit={handleRejectSubmit}
      />

      <ReasonDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel booking"
        description="Use a cancellation note when the requester should understand why a pending or approved booking was stopped."
        label="Cancellation note"
        placeholder="Optional note for the requester"
        helperText="Optional, but useful for approved bookings so the requester has clear feedback."
        initialValue={cancelTarget?.cancellationReason || ''}
        confirmLabel={actionKey === `cancel-${cancelTarget?.id}` ? 'Cancelling...' : 'Cancel booking'}
        confirmTone="danger"
        isBusy={Boolean(cancelTarget) && actionKey === `cancel-${cancelTarget?.id}`}
        onClose={() => {
          if (!actionKey.startsWith('cancel-')) {
            setCancelTarget(null)
          }
        }}
        onSubmit={handleCancelSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete booking permanently"
        description="This removes the booking record from the database for both the requester and the admin review console."
        confirmLabel={actionKey === `delete-${deleteTarget?.id}` ? 'Deleting...' : 'Delete permanently'}
        confirmTone="danger"
        isBusy={Boolean(deleteTarget) && actionKey === `delete-${deleteTarget?.id}`}
        onClose={() => {
          if (!actionKey.startsWith('delete-')) {
            setDeleteTarget(null)
          }
        }}
        onConfirm={handleDeleteConfirm}
      >
        {deleteTarget ? (
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">{deleteTarget.resourceName}</p>
            <p>{formatBookingDate(deleteTarget.bookingDate)} at {formatTimeRange(deleteTarget.startTime, deleteTarget.endTime)}</p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}

export default AdminBookingReviewPage
