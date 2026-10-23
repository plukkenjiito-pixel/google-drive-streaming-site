import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { VideoThumb } from '@/components/video-thumb'
import {
  displayTitle,
  formatDuration,
  formatSize,
  previewUrl,
  type Library,
  type Video,
} from '@/lib/catalog'
import type { Metadata } from 'next'

const UUID = /^[0-9a-f-]{36}$/i

async function getVideo(id: string) {
  if (!UUID.test(id)) return null
  const supabase = await createClient()
  const { data } = await supabase.from('videos').select('*').eq('id', id).maybeSingle()
  return { supabase, video: data as Video | null }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getVideo(id)
  return { title: result?.video ? `${displayTitle(result.video.name)} · DriveFlix` : 'DriveFlix' }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getVideo(id)
  if (!result?.video) notFound()
  const { supabase, video } = result

  const [{ data: library }, { data: siblings }] = await Promise.all([
    supabase.from('libraries').select('*').eq('id', video.library_id).maybeSingle(),
    supabase
      .from('videos')
      .select('*')
      .eq('library_id', video.library_id)
      .order('folder_path', { ascending: true, nullsFirst: true })
      .order('name', { ascending: true })
      .limit(200),
  ])

  const lib = library as Library | null
  const list = (siblings ?? []) as Video[]
  const index = list.findIndex((v) => v.id === video.id)
  const upNext = index >= 0 ? [...list.slice(index + 1), ...list.slice(0, index)] : list
  const title = displayTitle(video.name)
  const meta = [formatDuration(video.duration_ms), formatSize(video.size_bytes), video.folder_path]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {lib && (
            <Link
              href={`/library/${lib.id}`}
              className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {lib.name}
            </Link>
          )}
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
            <iframe
              src={previewUrl(video.drive_file_id)}
              title={title}
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              className="size-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-pretty text-xl font-semibold md:text-2xl">{title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
              <a
                href={`https://drive.google.com/file/d/${video.drive_file_id}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Open in Google Drive
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {upNext.length > 0 && (
          <aside aria-labelledby="up-next" className="flex w-full flex-col gap-3 lg:w-80">
            <h2 id="up-next" className="font-semibold">
              Up next
            </h2>
            <ul className="flex flex-col gap-3">
              {upNext.slice(0, 20).map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/watch/${v.id}`}
                    className="group flex gap-3 rounded-lg p-1 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <VideoThumb driveFileId={v.drive_file_id} alt="" width={320} className="w-36 shrink-0" />
                    <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
                      <span className="line-clamp-2 text-sm font-medium leading-snug">
                        {displayTitle(v.name)}
                      </span>
                      {formatDuration(v.duration_ms) && (
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatDuration(v.duration_ms)}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>
    </>
  )
}
