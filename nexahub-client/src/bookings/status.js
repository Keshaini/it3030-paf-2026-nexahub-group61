const STATUS_META = {
  PENDING: {
    label: 'Pending',
    className: 'border border-amber-200 bg-amber-100 text-amber-800',
  },
  APPROVED: {
    label: 'Approved',
    className: 'border border-emerald-200 bg-emerald-100 text-emerald-800',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'border border-rose-200 bg-rose-100 text-rose-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'border border-slate-200 bg-slate-100 text-slate-700',
  },
}

export const bookingStatusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const getBookingStatusMeta = (status) => STATUS_META[status] ?? {
  label: status || 'Unknown',
  className: 'border border-slate-200 bg-slate-100 text-slate-700',
}
