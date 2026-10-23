import Link from 'next/link'
import { Info, Play } from 'lucide-react'
import { BillboardBackdrop } from '@/components/billboard-backdrop'

export function Billboard({
  eyebrow,
  title,
  description,
  backdropFileId,
  playHref,
  infoHref,
  infoLabel = 'More Info',
}: {
  eyebrow?: string
  title: string
  description?: string | null
  backdropFileId?: string
  playHref?: string
  infoHref?: string
  infoLabel?: string
}) {
  return (
    <section className="relative flex min-h-[70svh] w-full items-end overflow-hidden md:min-h-[85svh]">
      <BillboardBackdrop driveFileId={backdropFileId} />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-4 px-[4%] pb-[14%] md:pb-[10%]">
        {eyebrow && (
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-foreground/90 uppercase">
            <span className="text-lg leading-none font-black tracking-tighter text-primary">D</span>
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-4xl leading-none font-black tracking-tight drop-shadow-lg md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="line-clamp-3 max-w-xl text-pretty text-sm text-foreground/90 drop-shadow md:text-lg">
            {description}
          </p>
        )}
        {(playHref || infoHref) && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {playHref && (
              <Link
                href={playHref}
                className="flex items-center gap-2 rounded bg-white px-5 py-2 text-base font-bold text-black transition-colors hover:bg-white/75 md:px-7 md:py-2.5 md:text-lg"
              >
                <Play className="size-5 fill-current md:size-6" aria-hidden="true" />
                Play
              </Link>
            )}
            {infoHref && (
              <Link
                href={infoHref}
                className="flex items-center gap-2 rounded bg-neutral-500/70 px-5 py-2 text-base font-bold text-white transition-colors hover:bg-neutral-500/50 md:px-7 md:py-2.5 md:text-lg"
              >
                <Info className="size-5 md:size-6" aria-hidden="true" />
                {infoLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
