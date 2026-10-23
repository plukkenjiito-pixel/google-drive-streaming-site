'use client'

import { useState } from 'react'
import { Film } from 'lucide-react'
import { thumbnailUrl } from '@/lib/catalog'
import { cn } from '@/lib/utils'

export function VideoThumb({
  driveFileId,
  alt,
  className,
  width = 640,
}: {
  driveFileId: string
  alt: string
  className?: string
  width?: number
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative aspect-video overflow-hidden rounded-md bg-muted', className)}>
      {failed ? (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
          <Film className="size-8 text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl(driveFileId, width)}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </div>
  )
}
