export type Library = {
  id: string
  name: string
  description: string | null
  drive_folder_id: string
  last_synced_at: string | null
  created_at: string
}

export type Video = {
  id: string
  library_id: string
  drive_file_id: string
  name: string
  mime_type: string | null
  size_bytes: number | null
  duration_ms: number | null
  folder_path: string | null
  drive_created_at: string | null
  created_at: string
}

export function displayTitle(fileName: string) {
  return fileName.replace(/\.[a-z0-9]{2,4}$/i, '').replace(/[._]+/g, ' ').trim()
}

export function formatDuration(ms: number | null) {
  if (!ms) return null
  const total = Math.round(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function formatSize(bytes: number | null) {
  if (!bytes) return null
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function thumbnailUrl(driveFileId: string, width = 640) {
  return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w${width}`
}

export function previewUrl(driveFileId: string) {
  return `https://drive.google.com/file/d/${driveFileId}/preview`
}
