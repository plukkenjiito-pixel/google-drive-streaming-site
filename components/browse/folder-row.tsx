import { DriveAuthError, listFolderVideos } from '@/lib/google'
import { formatDuration } from '@/lib/format'
import { VideoRow } from './video-row'

export async function FolderRow({
  userId,
  folderId,
  title,
}: {
  userId: string
  folderId: string
  title: string
}) {
  let videos
  try {
    videos = await listFolderVideos(userId, folderId)
  } catch (error) {
    if (error instanceof DriveAuthError) return null
    console.error('Failed to load folder', folderId, error)
    return null
  }
  if (videos.length === 0) return null

  return (
    <VideoRow
      title={title}
      items={videos.map((v) => ({
        id: v.id,
        name: v.name,
        hasThumbnail: v.hasThumbnail,
        meta: formatDuration(v.durationMs),
      }))}
    />
  )
}
