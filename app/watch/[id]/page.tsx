import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MediaRow, MediaRowItem } from '@/components/media-row'
import { VideoCard } from '@/components/video-card'
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
  const meta = [formatDuration(video.duration_ms), formatSize(video.size_bytes), video.folder_path].filter(
    Boolean,
  )

  return (
    <main className="min-h-dvh bg-black pb-16">
      <div className="relative">
        <Link
          href={lib ? `/library/${lib.id}` : '/'}
          aria-label={lib ? `Back to ${lib.name}` : 'Back to home'}
          className="absolute top-3 left-3 z-20 flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/90 md:top-5 md:left-5"
        >
          <ArrowLeft className="size-6" aria-hidden="true" />
        </Link>
        <div className="mx-auto aspect-video max-h-[85svh] w-full bg-black">
          <iframe
            src={previewUrl(video.drive_file_id)}
            title={title}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            className="size-full"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-[4%] py-6 md:py-8">
        {lib && (
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-foreground/80 uppercase">
            <span className="text-lg leading-none font-black tracking-tighter text-primary">D</span>
            {lib.name}
          </p>
        )}
        <h1 className="text-balance text-2xl font-black tracking-tight md:text-4xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="font-semibold text-green-500">New</span>
          {meta.map((m) => (
            <span key={m as string} className="text-foreground/80">
              {m}
            </span>
          ))}
          <span className="rounded-sm border border-foreground/40 px-1.5 text-[11px] font-semibold text-foreground/80">
            HD
          </span>
          <a
            href={`https://drive.google.com/file/d/${video.drive_file_id}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-foreground/70 hover:text-foreground"
          >
            Open in Drive
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {upNext.length > 0 && (
        <MediaRow title={lib ? `More from ${lib.name}` : 'More to watch'} href={lib ? `/library/${lib.id}` : undefined}>
          {upNext.slice(0, 30).map((v) => (
            <MediaRowItem key={v.id}>
              <VideoCard video={v} />
            </MediaRowItem>
          ))}
        </MediaRow>
      )}
    </main>
  )
}
