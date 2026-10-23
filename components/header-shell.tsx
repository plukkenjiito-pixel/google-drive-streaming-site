'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
        scrolled
          ? 'bg-background'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent',
      )}
    >
      {children}
    </header>
  )
}
