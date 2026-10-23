'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { thumbUrl } from '@/lib/format'

export type CardItem = {
  id: string
  name: string
  hasThumbnail: boolean
  meta?: string | null
  progress?: number
}

export function VideoCard({ item }: { item: CardItem }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = item.hasThumbnail && !imageFailed

  return (
    <Link
      href={`/watch/${item.id}`}
      className="group/card relative block w-[44vw] shrink-0 snap-start sm:w-[30vw] md:w-[23vw] lg:w-[18vw] xl:w-[15.5vw]"
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-card ring-0 ring-foreground/80 transition duration-300 group-hover/card:scale-[1.04] group-hover/card:ring-2 group-focus-visible/card:ring-2">
        {showImage ? (
          <img
            src={thumbUrl(item.id) || '/placeholder.svg'}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-end bg-gradient-to-br from-secondary via-card to-primary/40 p-3">
            <span className="line-clamp-2 text-sm font-bold leading-tight">{item.name}</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/card:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full border-2 border-foreground bg-black/50">
            <Play className="size-5 fill-foreground" aria-hidden="true" />
          </span>
        </div>

        {typeof item.progress === 'number' ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-muted-foreground/40">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, Math.max(2, item.progress * 100))}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium">{item.name}</p>
        {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
      </div>
    </Link>
  )
}
