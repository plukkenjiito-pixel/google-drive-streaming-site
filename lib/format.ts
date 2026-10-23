export function formatDuration(ms: number | null | undefined) {
  if (!ms || ms <= 0) return null
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 1) return '<1m'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function thumbUrl(fileId: string, size: 'w480' | 'w1280' | 'w1920' = 'w480') {
  return `/api/thumb/${fileId}?size=${size}`
}
