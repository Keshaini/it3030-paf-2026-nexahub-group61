export const formatBookingDate = (value) => {
  if (!value) {
    return 'Date not set'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`))
}

export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return 'Time not set'
  }

  const formatValue = (value) => new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(`1970-01-01T${value}`))

  return `${formatValue(startTime)} - ${formatValue(endTime)}`
}

export const formatDateTime = (value) => {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
