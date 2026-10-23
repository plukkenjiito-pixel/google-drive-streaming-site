'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { VideoCard } from '@/components/video-card'
import { MediaRow, MediaRowItem } from '@/components/media-row'
import type { Video } from '@/lib/catalog'

export function LibraryBrowser({ videos }: { videos: Video[] }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const groups = useMemo(() => {
    const map = new Map<string, Video[]>()
    for (const v of videos) {
      const key = v.folder_path ?? ''
      map.set(key, [...(map.get(key) ?? []), v])
    }
    return [...map.entries()]
  }, [videos])

  const results = useMemo(
    () =>
      q
        ? videos.filter(
            (v) => v.name.toLowerCase().includes(q) || (v.folder_path ?? '').toLowerCase().includes(q),
          )
        : [],
    [videos, q],
  )

  if (videos.length === 0) {
    return (
      <p className="px-[4%] text-muted-foreground">
        No videos in this library yet. Make sure the folder is shared publicly, then sync it from the
        admin page.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="px-[4%]">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/70"
            aria-hidden="true"
          />
          <label htmlFor="video-search" className="sr-only">
            Search titles
          </label>
          <input
            id="video-search"
            type="search"
            placeholder="Titles, folders"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-sm border border-foreground/40 bg-black/70 pr-3 pl-9 text-sm text-foreground placeholder:text-foreground/50 focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {q ? (
        <section aria-live="polite" className="flex flex-col gap-3 px-[4%]">
          <h2 className="text-sm text-muted-foreground">
            {results.length === 0
              ? `Your search for "${query}" did not have any matches.`
              : `${results.length} result${results.length === 1 ? '' : 's'}`}
          </h2>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((video) => (
              <li key={video.id}>
                <VideoCard video={video} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        groups.map(([folder, items]) => (
          <MediaRow key={folder || 'root'} title={folder || (groups.length > 1 ? 'Main folder' : 'All videos')}>
            {items.map((video) => (
              <MediaRowItem key={video.id}>
                <VideoCard video={video} />
              </MediaRowItem>
            ))}
          </MediaRow>
        ))
      )}
    </div>
  )
}
