import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { Billboard } from '@/components/billboard'
import { LibraryBrowser } from '@/components/library-browser'
import type { Library, Video } from '@/lib/catalog'

export default async function LibraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = await createClient()
  const [{ data: library }, { data: videos }] = await Promise.all([
    supabase.from('libraries').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('videos')
      .select('*')
      .eq('library_id', id)
      .order('folder_path', { ascending: true, nullsFirst: true })
      .order('name', { ascending: true }),
  ])

  if (!library) notFound()
  const lib = library as Library
  const list = (videos ?? []) as Video[]
  const first = list[0]

  return (
    <>
      <SiteHeader />
      <main className="pb-16">
        <Billboard
          eyebrow={`Library · ${list.length} video${list.length === 1 ? '' : 's'}`}
          title={lib.name}
          description={lib.description}
          backdropFileId={first?.drive_file_id}
          playHref={first ? `/watch/${first.id}` : undefined}
        />
        <div className="relative z-10 -mt-16 md:-mt-28">
          <LibraryBrowser videos={list} />
        </div>
      </main>
    </>
  )
}
