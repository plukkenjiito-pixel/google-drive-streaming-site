import Link from 'next/link'
import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'text-2xl font-black uppercase tracking-tighter text-primary md:text-3xl',
        className,
      )}
    >
      StreamHive
    </Link>
  )
}
