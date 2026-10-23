import Link from 'next/link'
import { Play } from 'lucide-react'
import { VideoThumb } from '@/components/video-thumb'
import { displayTitle, formatDuration, type Video } from '@/lib/catalog'

export function VideoCard({ video }: { video: Video }) {
  const title = displayTitle(video.name)
  const duration = formatDuration(video.duration_ms)

  return (
    <Link
      href={`/watch/${video.id}`}
      className="group flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative">
        <VideoThumb driveFileId={video.drive_file_id} alt="" />
        <div className="absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 transition-opacity group-hover:bg-background/40 group-hover:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-5 translate-x-px fill-current" aria-hidden="true" />
          </span>
        </div>
        {duration && (
          <span className="absolute right-2 bottom-2 rounded bg-background/85 px-1.5 py-0.5 font-mono text-xs">
            {duration}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{title}</h3>
        {video.folder_path && (
          <p className="truncate text-xs text-muted-foreground">{video.folder_path}</p>
        )}
      </div>
    </Link>
  )
}
