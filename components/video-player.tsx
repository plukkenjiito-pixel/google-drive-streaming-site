'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { saveWatchProgress } from '@/app/actions/library'

const SAVE_INTERVAL_SECONDS = 10

export function VideoPlayer({
  fileId,
  title,
  mimeType,
  startAt,
}: {
  fileId: string
  title: string
  mimeType: string
  startAt: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSavedRef = useRef(0)
  const [failed, setFailed] = useState(false)

  function persist() {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    lastSavedRef.current = video.currentTime
    saveWatchProgress({
      fileId,
      name: title,
      position: video.currentTime,
      duration: video.duration,
    }).catch(() => {})
  }

  function handleLoadedMetadata() {
    const video = videoRef.current
    if (!video) return
    if (startAt > 5 && startAt < video.duration - 10) video.currentTime = startAt
  }

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    if (Math.abs(video.currentTime - lastSavedRef.current) >= SAVE_INTERVAL_SECONDS) persist()
  }

  return (
    <div className="group relative flex h-dvh w-full items-center justify-center bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent p-4 opacity-100 transition-opacity md:p-6 md:opacity-0 md:group-hover:opacity-100">
        <Link
          href="/"
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="size-7" aria-hidden="true" />
          <span className="sr-only">Back to browse</span>
        </Link>
        <h1 className="truncate text-lg font-semibold md:text-2xl">{title}</h1>
      </div>

      {failed ? (
        <div className="max-w-md px-6 text-center">
          <p className="text-xl font-semibold">{"This video can't be played in your browser"}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {`The file format (${mimeType}) may not be supported. MP4 (H.264) and WebM play best. Try Chrome or Edge for MKV files.`}
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={`/api/stream/${fileId}`}
          controls
          autoPlay
          playsInline
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPause={persist}
          onEnded={persist}
          onError={() => setFailed(true)}
          className="max-h-dvh w-full"
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  )
}
