'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function MediaRow({
  id,
  title,
  href,
  children,
}: {
  id?: string
  title: string
  href?: string
  children: React.ReactNode
}) {
  const trackRef = useRef<HTMLUListElement>(null)
  const headingId = `${id ?? title.replace(/\W+/g, '-').toLowerCase()}-heading`

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <section id={id} aria-labelledby={headingId} className="group/row relative flex scroll-mt-20 flex-col gap-2">
      <h2 id={headingId} className="px-[4%] text-base font-bold md:text-xl">
        {href ? (
          <Link href={href} className="group/title inline-flex items-center gap-1 hover:text-foreground">
            {title}
            <span className="flex items-center text-xs font-semibold text-sky-400 opacity-0 transition-opacity group-hover/title:opacity-100">
              Explore all
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        ) : (
          title
        )}
      </h2>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${title} left`}
          className="absolute top-0 left-0 z-20 hidden h-full w-[4%] items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-black/70 focus-visible:opacity-100 md:flex"
        >
          <ChevronLeft className="size-8" aria-hidden="true" />
        </button>
        <ul
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory scroll-px-[4%] gap-2 overflow-x-auto overflow-y-visible px-[4%] py-4"
        >
          {children}
        </ul>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label={`Scroll ${title} right`}
          className="absolute top-0 right-0 z-20 hidden h-full w-[4%] items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-black/70 focus-visible:opacity-100 md:flex"
        >
          <ChevronRight className="size-8" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export function MediaRowItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="w-[44%] shrink-0 snap-start sm:w-[31%] md:w-[23.5%] lg:w-[18.8%] xl:w-[15.6%]">
      {children}
    </li>
  )
}
