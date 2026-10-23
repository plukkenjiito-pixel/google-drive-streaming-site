import Link from 'next/link'
import { FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { VideoCard } from '@/components/video-card'
import { VideoThumb } from '@/components/video-thumb'
import { buttonVariants } from '@/components/ui/button'
import type { Library, Video } from '@/lib/catalog'

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: libraries }, { data: recent }, { data: covers }] = await Promise.all([
    supabase.from('libraries').select('*').order('created_at', { ascending: false }),
    supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(12),
    supabase.from('videos').select('library_id, drive_file_id').limit(500),
  ])

  const libs = (libraries ?? []) as Library[]
  const recentVideos = (recent ?? []) as Video[]
  const coverByLibrary = new Map<string, string>()
  const countByLibrary = new Map<string, number>()
  for (const v of covers ?? []) {
    if (!coverByLibrary.has(v.library_id)) coverByLibrary.set(v.library_id, v.drive_file_id)
    countByLibrary.set(v.library_id, (countByLibrary.get(v.library_id) ?? 0) + 1)
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 md:px-6 md:py-12">
        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Your library</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Stream straight from Google Drive.
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground md:text-lg">
            Every video in your shared Drive folders, organized and ready to play.
          </p>
        </section>

        {libs.length === 0 ? (
          <section className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <FolderOpen className="size-10 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-medium">No libraries yet</h2>
              <p className="text-sm text-muted-foreground">
                Sign in as admin and add a public Google Drive folder to get started.
              </p>
            </div>
            <Link href="/admin" className={buttonVariants()}>
              Add a Drive folder
            </Link>
          </section>
        ) : (
          <section aria-labelledby="libraries-heading" className="flex flex-col gap-4">
            <h2 id="libraries-heading" className="text-xl font-semibold">
              Libraries
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {libs.map((lib) => {
                const cover = coverByLibrary.get(lib.id)
                const count = countByLibrary.get(lib.id) ?? 0
                return (
                  <li key={lib.id}>
                    <Link
                      href={`/library/${lib.id}`}
                      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {cover ? (
                        <VideoThumb driveFileId={cover} alt="" />
                      ) : (
                        <div className="flex aspect-video items-center justify-center rounded-md bg-muted">
                          <FolderOpen className="size-8 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3 px-1">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <h3 className="truncate font-medium">{lib.name}</h3>
                          {lib.description && (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {lib.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {count} video{count === 1 ? '' : 's'}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {recentVideos.length > 0 && (
          <section aria-labelledby="recent-heading" className="flex flex-col gap-4">
            <h2 id="recent-heading" className="text-xl font-semibold">
              Recently added
            </h2>
            <ul className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentVideos.map((video) => (
                <li key={video.id}>
                  <VideoCard video={video} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  )
}
