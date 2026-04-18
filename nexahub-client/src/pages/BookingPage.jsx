import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import logo from '../assets/edutrack.png'
import { getAuthUser, getDashboardPath } from '../auth/roles.js'
import { cancelBooking, createBooking, deleteBooking, fetchMyBookings, fetchResources, updateBooking } from '../bookings/api.js'
import { formatBookingDate, formatDateTime, formatTimeRange } from '../bookings/format.js'
import { bookingStatusOptions } from '../bookings/status.js'
import BookingStatusBadge from '../components/BookingStatusBadge.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ReasonDialog from '../components/ReasonDialog.jsx'
import UserPortalSidebar from '../components/UserPortalSidebar.jsx'

const createInitialForm = () => ({
  resourceId: '',
  bookingDate: '',
  startTime: '09:00',
  endTime: '10:00',
  purpose: '',
  expectedAttendees: '1',
})

const BookingPage = () => {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    resourceId: '',
    bookingDate: '',
  })
  const [formData, setFormData] = useState(createInitialForm)
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionKey, setActionKey] = useState('')
  const [pageStatus, setPageStatus] = useState('')
  const [formStatus, setFormStatus] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadPageData = async () => {
    if (!user?.email) {
      return
    }

    setIsLoading(true)
    setPageStatus('')

    try {
      const [resourceData, bookingData] = await Promise.all([
        fetchResources(),
        fetchMyBookings(user.email),
      ])

      setResources(Array.isArray(resourceData) ? resourceData : [])
      setBookings(Array.isArray(bookingData) ? bookingData : [])
    } catch (error) {
      setPageStatus(error.message || 'Failed to load booking data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [user?.email])

  useEffect(() => {
    if (!formData.resourceId && resources.length > 0) {
      setFormData((prev) => ({
        ...prev,
        resourceId: String(resources[0].id),
      }))
    }
  }, [resources, formData.resourceId])

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const matchesStatus = !filters.status || booking.status === filters.status
    const matchesResource = !filters.resourceId || String(booking.resourceId) === filters.resourceId
    const matchesDate = !filters.bookingDate || booking.bookingDate === filters.bookingDate

    return matchesStatus && matchesResource && matchesDate
  }), [bookings, filters])

  const isEditMode = editingBookingId !== null
  const selectedResource = resources.find((resource) => String(resource.id) === formData.resourceId)
  const pendingCount = bookings.filter((booking) => booking.status === 'PENDING').length
  const approvedCount = bookings.filter((booking) => booking.status === 'APPROVED').length
  const closedCount = bookings.filter((booking) => ['REJECTED', 'CANCELLED'].includes(booking.status)).length

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  const resetBookingForm = () => {
    setEditingBookingId(null)
    setFormData((prev) => ({
      ...createInitialForm(),
      resourceId: prev.resourceId || (resources[0] ? String(resources[0].id) : ''),
    }))
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormStatus('')
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStartEdit = (booking) => {
    setEditingBookingId(booking.id)
    setFormStatus('')
    setPageStatus('')
    setFormData({
      resourceId: String(booking.resourceId),
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      expectedAttendees: String(booking.expectedAttendees),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setFormStatus('')
    resetBookingForm()
  }

  const handleSubmitBooking = async (event) => {
    event.preventDefault()
    setFormStatus('')
    setIsSubmitting(true)

    const payload = {
      requesterEmail: user.email,
      resourceId: Number(formData.resourceId),
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose.trim(),
      expectedAttendees: Number(formData.expectedAttendees),
    }

    try {
      if (isEditMode) {
        await updateBooking(editingBookingId, payload)
        setFormStatus('Pending booking updated successfully.')
      } else {
        await createBooking(payload)
        setFormStatus('Booking request submitted. It is now waiting for admin review.')
      }

      resetBookingForm()
      await loadPageData()
    } catch (error) {
      setFormStatus(error.message || 'Booking request failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelBooking = (booking) => {
    setPageStatus('')
    setCancelTarget(booking)
  }

  const handleCancelBookingSubmit = async (reason) => {
    if (!cancelTarget) {
      return
    }

    setActionKey(`cancel-${cancelTarget.id}`)
    setPageStatus('')

    try {
      await cancelBooking(cancelTarget.id, user.email, reason)
      setPageStatus(`Booking for ${cancelTarget.resourceName} was cancelled.`)
      setCancelTarget(null)

      if (editingBookingId === cancelTarget.id) {
        resetBookingForm()
      }

      await loadPageData()
    } catch (error) {
      setPageStatus(error.message || 'Failed to cancel booking.')
    } finally {
      setActionKey('')
    }
  }

  const handleDeleteBooking = (booking) => {
    setPageStatus('')
    setDeleteTarget(booking)
  }

  const handleDeleteBookingConfirm = async () => {
    if (!deleteTarget) {
      return
    }

    setActionKey(`delete-${deleteTarget.id}`)
    setPageStatus('')

    try {
      await deleteBooking(deleteTarget.id, user.email)
      setPageStatus(`Booking for ${deleteTarget.resourceName} was deleted.`)
      setDeleteTarget(null)

      if (editingBookingId === deleteTarget.id) {
        resetBookingForm()
      }

      await loadPageData()
    } catch (error) {
      setPageStatus(error.message || 'Failed to delete booking.')
    } finally {
      setActionKey('')
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5efe8] p-2 sm:p-3 lg:p-4">
      <div className="grid h-full w-full gap-3 rounded-[2rem] bg-slate-50 p-3 shadow-2xl lg:grid-cols-[260px_minmax(0,1fr)] lg:p-4">
        <UserPortalSidebar user={user} activeItem="bookings" onLogout={handleLogout} />

        <main className="overflow-auto rounded-[1.5rem] bg-white p-4 sm:p-6">
          <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,#f6efe7_0%,#eef5ff_100%)] p-4 shadow-2xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <img src={logo} alt="EduTrack logo" className="h-11 w-11 rounded-2xl object-cover shadow" />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Booking Management</p>
                  <h1 className="text-3xl font-black text-slate-900">Resource Booking Workspace</h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(getDashboardPath(user.role))}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Back to dashboard
                </button>
                <button
                  type="button"
                  onClick={loadPageData}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                >
                  Refresh data
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="space-y-5">
                <section className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Signed in user</p>
                  <h2 className="mt-2 text-2xl font-black">{user.fullName}</h2>
                  <p className="text-sm text-slate-300">{user.email}</p>
                  <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">{user.role}</p>
                  <p className="mt-5 text-sm leading-6 text-slate-300">
                    Submit a resource request, edit pending requests, and cancel active bookings without touching the other modules.
                  </p>
                </section>

                <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{isEditMode ? 'Edit request' : 'New request'}</p>
                      <h2 className="text-2xl font-black text-slate-900">{isEditMode ? 'Edit pending booking' : 'Book a resource'}</h2>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
                      {isEditMode ? 'Pending only' : 'Conflict safe'}
                    </span>
                  </div>

                  <form className="mt-5 space-y-4" onSubmit={handleSubmitBooking}>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="resourceId">
                        Resource
                      </label>
                      <select
                        id="resourceId"
                        name="resourceId"
                        value={formData.resourceId}
                        onChange={handleFormChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-100"
                        required
                      >
                        {resources.map((resource) => (
                          <option key={resource.id} value={resource.id}>
                            {resource.name} ({resource.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="bookingDate">
                          Date
                        </label>
                        <input
                          id="bookingDate"
                          name="bookingDate"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.bookingDate}
                          onChange={handleFormChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="expectedAttendees">
                          Attendees
                        </label>
                        <input
                          id="expectedAttendees"
                          name="expectedAttendees"
                          type="number"
                          min="1"
                          max={selectedResource?.capacity || 100}
                          value={formData.expectedAttendees}
                          onChange={handleFormChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-100"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="startTime">
                          Start time
                        </label>
                        <input
                          id="startTime"
                          name="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={handleFormChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="endTime">
                          End time
                        </label>
                        <input
                          id="endTime"
                          name="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={handleFormChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-100"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="purpose">
                        Purpose
                      </label>
                      <textarea
                        id="purpose"
                        name="purpose"
                        rows="4"
                        maxLength="240"
                        value={formData.purpose}
                        onChange={handleFormChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-4 focus:ring-cyan-100"
                        placeholder="Describe why you need this room, lab, or equipment."
                        required
                      />
                    </div>

                    {selectedResource ? (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">{selectedResource.name}</p>
                        <p>{selectedResource.location}</p>
                        <p>Capacity: {selectedResource.capacity}</p>
                      </div>
                    ) : null}

                    {isEditMode ? (
                      <p className="text-sm text-slate-500">Only bookings that are still pending can be edited.</p>
                    ) : null}

                    {formStatus ? <p className="text-sm text-slate-700">{formStatus}</p> : null}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={isSubmitting || resources.length === 0}
                        className="water-button w-full rounded-2xl py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 disabled:opacity-60"
                      >
                        {isSubmitting ? (isEditMode ? 'Updating booking...' : 'Submitting request...') : (isEditMode ? 'Update pending booking' : 'Submit booking request')}
                      </button>

                      {isEditMode ? (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:max-w-[170px]"
                        >
                          Cancel edit
                        </button>
                      ) : null}
                    </div>
                  </form>
                </section>
              </aside>

              <div className="space-y-5">
            <section className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'Pending review', value: pendingCount, tone: 'from-amber-200 to-amber-50 text-amber-900' },
                { label: 'Approved bookings', value: approvedCount, tone: 'from-emerald-200 to-emerald-50 text-emerald-900' },
                { label: 'Closed requests', value: closedCount, tone: 'from-slate-200 to-slate-50 text-slate-900' },
              ].map((card) => (
                <article key={card.label} className={`rounded-[1.75rem] border border-white/70 bg-gradient-to-br ${card.tone} p-5 shadow-sm`}>
                  <p className="text-xs uppercase tracking-[0.22em]">{card.label}</p>
                  <p className="mt-3 text-4xl font-black">{card.value}</p>
                </article>
              ))}
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">History</p>
                  <h2 className="text-2xl font-black text-slate-900">My bookings</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-cyan-100"
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
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-cyan-100"
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
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-cyan-100"
                  />
                </div>
              </div>

              {pageStatus ? <p className="mt-4 text-sm text-slate-700">{pageStatus}</p> : null}
              {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading your bookings...</p> : null}

              {!isLoading && filteredBookings.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                  No bookings matched the selected filters.
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                {filteredBookings.map((booking) => {
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
                          <p className="mt-2 text-sm text-slate-500">{booking.resourceCode} - {booking.resourceLocation}</p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                          <p>Requested on {formatDateTime(booking.createdAt)}</p>
                          <p>Capacity: {booking.resourceCapacity}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
                          <p className="mt-2 font-bold text-slate-900">{formatBookingDate(booking.bookingDate)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Time</p>
                          <p className="mt-2 font-bold text-slate-900">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Attendees</p>
                          <p className="mt-2 font-bold text-slate-900">{booking.expectedAttendees}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Reviewed by</p>
                          <p className="mt-2 font-bold text-slate-900">{booking.reviewedByName || 'Awaiting review'}</p>
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
                      </div>

                      {['PENDING', 'APPROVED', 'REJECTED'].includes(booking.status) ? (
                        <div className="mt-4 flex justify-end gap-2">
                          {booking.status === 'PENDING' ? (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(booking)}
                              className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                            >
                              Edit booking
                            </button>
                          ) : null}

                          {['PENDING', 'APPROVED'].includes(booking.status) ? (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(booking)}
                              disabled={actionKey === cancelKey}
                              className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                            >
                              {actionKey === cancelKey ? 'Cancelling...' : 'Cancel booking'}
                            </button>
                          ) : null}

                          {['PENDING', 'REJECTED'].includes(booking.status) ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(booking)}
                              disabled={actionKey === deleteKey}
                              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                            >
                              {actionKey === deleteKey ? 'Deleting...' : 'Delete booking'}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ReasonDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel booking"
        description="Use a short note when the admin or your team may need context for why this booking is being cancelled."
        label="Cancellation note"
        placeholder="Optional note for this cancellation"
        helperText="Optional. Leaving it blank keeps the cancellation clean and quick."
        initialValue={cancelTarget?.cancellationReason || ''}
        confirmLabel={actionKey === `cancel-${cancelTarget?.id}` ? 'Cancelling...' : 'Cancel booking'}
        confirmTone="danger"
        isBusy={Boolean(cancelTarget) && actionKey === `cancel-${cancelTarget?.id}`}
        onClose={() => {
          if (!actionKey.startsWith('cancel-')) {
            setCancelTarget(null)
          }
        }}
        onSubmit={handleCancelBookingSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete booking request"
        description="Delete only requests you no longer need. This permanently removes the booking record from your history."
        confirmLabel={actionKey === `delete-${deleteTarget?.id}` ? 'Deleting...' : 'Delete booking'}
        confirmTone="danger"
        isBusy={Boolean(deleteTarget) && actionKey === `delete-${deleteTarget?.id}`}
        onClose={() => {
          if (!actionKey.startsWith('delete-')) {
            setDeleteTarget(null)
          }
        }}
        onConfirm={handleDeleteBookingConfirm}
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

export default BookingPage
