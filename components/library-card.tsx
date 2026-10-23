import Link from 'next/link'
import { FolderOpen } from 'lucide-react'
import { VideoThumb } from '@/components/video-thumb'
import type { Library } from '@/lib/catalog'

export function LibraryCard({
  library,
  coverFileId,
  count,
}: {
  library: Library
  coverFileId?: string
  count: number
}) {
  return (
    <Link
      href={`/library/${library.id}`}
      className="group relative block rounded transition-transform duration-300 outline-none hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {coverFileId ? (
        <VideoThumb driveFileId={coverFileId} alt="" className="rounded" />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded bg-muted">
          <FolderOpen className="size-8 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end rounded bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 md:p-3">
        <span className="mb-1 w-fit rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
          {count} video{count === 1 ? '' : 's'}
        </span>
        <h3 className="line-clamp-2 text-sm leading-tight font-black uppercase drop-shadow md:text-base">
          {library.name}
        </h3>
      </div>
    </Link>
  )
}
