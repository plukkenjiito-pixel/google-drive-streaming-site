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
      className="group relative block rounded transition-transform duration-300 outline-none hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <VideoThumb driveFileId={video.drive_file_id} alt="" className="rounded" />
      <div className="absolute inset-0 flex flex-col justify-end rounded bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 md:p-3">
        <div className="flex items-end justify-between gap-2">
          <h3 className="line-clamp-2 text-xs leading-tight font-bold drop-shadow md:text-sm">{title}</h3>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-black opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Play className="size-3.5 translate-x-px fill-current" aria-hidden="true" />
          </span>
        </div>
        {(duration || video.folder_path) && (
          <p className="mt-0.5 hidden truncate text-[11px] text-foreground/70 group-hover:block">
            {[duration, video.folder_path].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
