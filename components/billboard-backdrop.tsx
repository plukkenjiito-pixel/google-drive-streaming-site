'use client'

import { useState } from 'react'
import { thumbnailUrl } from '@/lib/catalog'

const FALLBACK = '/images/hero-fallback.png'

export function BillboardBackdrop({ driveFileId }: { driveFileId?: string }) {
  const [failed, setFailed] = useState(false)
  const src = driveFileId && !failed ? thumbnailUrl(driveFileId, 1920) : FALLBACK

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      fetchPriority="high"
      onError={() => setFailed(true)}
      className="absolute inset-0 size-full object-cover object-center"
    />
  )
}
