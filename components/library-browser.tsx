'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { VideoCard } from '@/components/video-card'
import type { Video } from '@/lib/catalog'

export function LibraryBrowser({ videos }: { videos: Video[] }) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? videos.filter(
          (v) =>
            v.name.toLowerCase().includes(q) || (v.folder_path ?? '').toLowerCase().includes(q),
        )
      : videos
    const map = new Map<string, Video[]>()
    for (const v of filtered) {
      const key = v.folder_path ?? ''
      map.set(key, [...(map.get(key) ?? []), v])
    }
    return [...map.entries()]
  }, [videos, query])

  if (videos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
        No videos found in this folder yet. Make sure the folder is shared publicly, then sync it
        from the admin page.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="video-search" className="sr-only">
          Search videos
        </label>
        <Input
          id="video-search"
          type="search"
          placeholder={`Search ${videos.length} videos`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {groups.length === 0 && (
        <p className="text-muted-foreground">{'No videos match "' + query + '".'}</p>
      )}

      {groups.map(([folder, items]) => (
        <section key={folder || 'root'} className="flex flex-col gap-4">
          {(folder || groups.length > 1) && (
            <h2 className="text-lg font-semibold">
              {folder || 'Main folder'}{' '}
              <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
            </h2>
          )}
          <ul className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((video) => (
              <li key={video.id}>
                <VideoCard video={video} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
