import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { Billboard } from '@/components/billboard'
import { MediaRow, MediaRowItem } from '@/components/media-row'
import { VideoCard } from '@/components/video-card'
import { LibraryCard } from '@/components/library-card'
import { displayTitle, formatDuration, type Library, type Video } from '@/lib/catalog'

const PER_ROW = 20

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: libraries }, { data: videos }] = await Promise.all([
    supabase.from('libraries').select('*').order('created_at', { ascending: false }),
    supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(1000),
  ])

  const libs = (libraries ?? []) as Library[]
  const allVideos = (videos ?? []) as Video[]
  const byLibrary = new Map<string, Video[]>()
  for (const v of allVideos) {
    byLibrary.set(v.library_id, [...(byLibrary.get(v.library_id) ?? []), v])
  }

  const featured = allVideos[0]
  const featuredLibrary = featured ? libs.find((l) => l.id === featured.library_id) : undefined

  return (
    <>
      <SiteHeader />
      <main className="pb-16">
        {featured ? (
          <Billboard
            eyebrow={featuredLibrary?.name ?? 'Featured'}
            title={displayTitle(featured.name)}
            description={
              featuredLibrary?.description ??
              ([formatDuration(featured.duration_ms), featured.folder_path].filter(Boolean).join(' · ') ||
                'Now streaming from your Google Drive.')
            }
            backdropFileId={featured.drive_file_id}
            playHref={`/watch/${featured.id}`}
            infoHref={featuredLibrary ? `/library/${featuredLibrary.id}` : undefined}
          />
        ) : (
          <Billboard
            eyebrow="Series"
            title="Your Drive. Your Cinema."
            description="Add a public Google Drive folder and every video inside becomes a title you can stream instantly."
            infoHref="/admin"
            infoLabel="Add a Drive folder"
          />
        )}

        <div
          className={
            libs.length > 0
              ? 'relative z-10 -mt-16 flex flex-col gap-4 md:-mt-28 md:gap-8'
              : 'relative z-10 flex flex-col gap-4'
          }
        >
          {libs.length > 0 && (
            <MediaRow id="libraries" title="Your Libraries">
              {libs.map((lib) => {
                const items = byLibrary.get(lib.id) ?? []
                return (
                  <MediaRowItem key={lib.id}>
                    <LibraryCard
                      library={lib}
                      coverFileId={items[0]?.drive_file_id}
                      count={items.length}
                    />
                  </MediaRowItem>
                )
              })}
            </MediaRow>
          )}

          {allVideos.length > 0 && (
            <MediaRow id="recent" title="Recently Added">
              {allVideos.slice(0, PER_ROW).map((video) => (
                <MediaRowItem key={video.id}>
                  <VideoCard video={video} />
                </MediaRowItem>
              ))}
            </MediaRow>
          )}

          {libs.map((lib) => {
            const items = byLibrary.get(lib.id) ?? []
            if (items.length === 0) return null
            return (
              <MediaRow key={lib.id} id={`lib-${lib.id}`} title={lib.name} href={`/library/${lib.id}`}>
                {items.slice(0, PER_ROW).map((video) => (
                  <MediaRowItem key={video.id}>
                    <VideoCard video={video} />
                  </MediaRowItem>
                ))}
              </MediaRow>
            )
          })}

          {libs.length === 0 && (
            <p className="px-[4%] text-sm text-muted-foreground">
              Nothing to watch yet.{' '}
              <Link href="/admin" className="font-semibold text-foreground underline underline-offset-4">
                Sign in as admin
              </Link>{' '}
              to add your first library.
            </p>
          )}
        </div>
      </main>
    </>
  )
}
