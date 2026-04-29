import { getBookingStatusMeta } from '../bookings/status.js'

const BookingStatusBadge = ({ status }) => {
  const meta = getBookingStatusMeta(status)

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${meta.className}`}>
      {meta.label}
    </span>
  )
}

export default BookingStatusBadge
