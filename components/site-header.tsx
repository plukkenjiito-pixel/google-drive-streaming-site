import Link from 'next/link'
import { Clapperboard } from 'lucide-react'
import { getAdminState } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export async function SiteHeader() {
  const { user } = await getAdminState()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clapperboard className="size-4" aria-hidden="true" />
          </span>
          <span className="text-balance">DriveFlix</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Browse
          </Link>
          <Link
            href={user ? '/admin' : '/auth/login'}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {user ? 'Admin' : 'Sign in'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
