import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All libraries
          </Link>
          <h1 className="text-balance text-3xl font-semibold tracking-tight">{lib.name}</h1>
          {lib.description && (
            <p className="max-w-2xl text-pretty text-muted-foreground">{lib.description}</p>
          )}
        </div>
        <LibraryBrowser videos={(videos ?? []) as Video[]} />
      </main>
    </>
  )
}
