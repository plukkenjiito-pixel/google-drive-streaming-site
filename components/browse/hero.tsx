import Link from 'next/link'
import { FolderCog, Play } from 'lucide-react'
import { DriveAuthError, listFolderVideos } from '@/lib/google'
import { formatDuration, thumbUrl } from '@/lib/format'
import { ReconnectBanner } from './reconnect-banner'

export async function Hero({
  userId,
  folders,
}: {
  userId: string
  folders: { folderId: string; name: string }[]
}) {
  let featured = null
  let folderName = ''
  try {
    for (const folder of folders) {
      const videos = await listFolderVideos(userId, folder.folderId)
      const pick = videos.find((v) => v.hasThumbnail) ?? videos[0]
      if (pick) {
        featured = pick
        folderName = folder.name
        break
      }
    }
  } catch (error) {
    if (error instanceof DriveAuthError) return <ReconnectBanner />
    throw error
  }

  if (!featured) {
    return (
      <section className="flex min-h-[60vh] flex-col items-start justify-end gap-4 bg-gradient-to-br from-primary/30 via-background to-background px-4 pb-16 pt-28 md:px-12">
        <h1 className="text-balance text-3xl font-bold md:text-5xl">No videos found yet</h1>
        <p className="max-w-lg text-pretty text-muted-foreground">
          {"The folders you selected don't contain any video files. Pick different folders to fill your library."}
        </p>
        <Link
          href="/folders"
          className="flex items-center gap-2 rounded-md bg-foreground px-6 py-2.5 font-semibold text-background hover:bg-foreground/80"
        >
          <FolderCog className="size-5" aria-hidden="true" />
          Choose folders
        </Link>
      </section>
    )
  }

  const duration = formatDuration(featured.durationMs)

  return (
    <section className="relative flex min-h-[70vh] items-end md:min-h-[85vh]">
      {featured.hasThumbnail ? (
        <img
          src={thumbUrl(featured.id, 'w1920') || '/placeholder.svg'}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-card to-background" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative z-10 flex max-w-2xl flex-col gap-4 px-4 pb-20 md:px-12 md:pb-32">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">{folderName}</p>
        <h1 className="text-balance text-4xl font-black leading-tight md:text-6xl">
          {featured.name}
        </h1>
        {duration ? <p className="text-sm text-foreground/80">{duration}</p> : null}
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={`/watch/${featured.id}`}
            className="flex items-center gap-2 rounded-md bg-foreground px-6 py-2.5 text-lg font-semibold text-background transition hover:bg-foreground/80"
          >
            <Play className="size-6 fill-background" aria-hidden="true" />
            Play
          </Link>
          <Link
            href="/folders"
            className="flex items-center gap-2 rounded-md bg-muted-foreground/40 px-6 py-2.5 text-lg font-semibold transition hover:bg-muted-foreground/30"
          >
            <FolderCog className="size-6" aria-hidden="true" />
            My Folders
          </Link>
        </div>
      </div>
    </section>
  )
}

export function HeroSkeleton() {
  return <div className="min-h-[70vh] animate-pulse bg-card md:min-h-[85vh]" aria-hidden="true" />
}
