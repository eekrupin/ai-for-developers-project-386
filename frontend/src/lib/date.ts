const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatDateTimeRange(startAt: string, endAt: string) {
  return `${formatDateTime(startAt)} - ${formatDateTime(endAt)}`
}

export function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined
}

export function toDateTimeInputValue(value: string) {
  const date = new Date(value)
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}
