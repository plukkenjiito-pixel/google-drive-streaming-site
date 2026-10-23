'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type CardItem, VideoCard } from './video-card'

export function VideoRow({ title, items }: { title: string; items: CardItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <section className="group/row relative" aria-label={title}>
      <h2 className="mb-2 px-4 text-lg font-bold md:px-12 md:text-xl">{title}</h2>
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={`Scroll ${title} left`}
          className="absolute inset-y-0 left-0 z-10 hidden w-12 items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
        >
          <ChevronLeft className="size-8" aria-hidden="true" />
        </button>
        <div
          ref={scrollerRef}
          className="scrollbar-none flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 py-3 md:scroll-px-12 md:px-12"
        >
          {items.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={`Scroll ${title} right`}
          className="absolute inset-y-0 right-0 z-10 hidden w-12 items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
        >
          <ChevronRight className="size-8" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export function VideoRowSkeleton({ title }: { title?: string }) {
  return (
    <div className="px-4 md:px-12" aria-hidden="true">
      {title ? (
        <p className="mb-2 text-lg font-bold md:text-xl">{title}</p>
      ) : (
        <div className="mb-3 h-6 w-40 animate-pulse rounded bg-card" />
      )}
      <div className="flex gap-2 overflow-hidden py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video w-[44vw] shrink-0 animate-pulse rounded-md bg-card sm:w-[30vw] md:w-[23vw] lg:w-[18vw] xl:w-[15.5vw]"
          />
        ))}
      </div>
    </div>
  )
}
