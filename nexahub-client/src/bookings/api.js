import { API_BASE_URL } from '../config.js'

const parseJson = async (response) => {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const data = await parseJson(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.')
  }

  return data
}

const buildQuery = (params) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export const fetchResources = () => request('/api/resources')

export const fetchMyBookings = (email) => request(`/api/bookings/my${buildQuery({ email })}`)

export const createBooking = (payload) => request('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

export const updateBooking = (bookingId, payload) => request(`/api/bookings/${bookingId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

export const deleteBooking = (bookingId, requesterEmail) => request(`/api/bookings/${bookingId}${buildQuery({ requesterEmail })}`, {
  method: 'DELETE',
})

export const deleteBookingAsAdmin = (bookingId, actorEmail) => request(`/api/bookings/${bookingId}/admin${buildQuery({ actorEmail })}`, {
  method: 'DELETE',
})

export const cancelBooking = (bookingId, actorEmail, reason) => request(`/api/bookings/${bookingId}/cancel`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ actorEmail, reason }),
})

export const fetchAllBookings = (actorEmail, filters) => request(`/api/bookings${buildQuery({
  actorEmail,
  resourceId: filters.resourceId,
  bookingDate: filters.bookingDate,
  status: filters.status,
})}`)

export const approveBooking = (bookingId, actorEmail) => request(`/api/bookings/${bookingId}/approve`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ actorEmail }),
})

export const rejectBooking = (bookingId, actorEmail, reason) => request(`/api/bookings/${bookingId}/reject`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ actorEmail, reason }),
})
