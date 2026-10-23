import Link from 'next/link'
import { getAdminState } from '@/lib/supabase/server'
import { HeaderShell } from '@/components/header-shell'

export async function SiteHeader() {
  const { user } = await getAdminState()

  return (
    <HeaderShell>
      <div className="flex h-16 items-center justify-between gap-4 px-[4%] md:h-[68px]">
        <div className="flex items-center gap-6 md:gap-10">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter text-primary uppercase md:text-3xl"
          >
            DriveFlix
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-5 text-sm md:flex">
            <Link href="/" className="font-medium text-foreground transition-colors hover:text-foreground/70">
              Home
            </Link>
            <Link href="/#libraries" className="text-foreground/80 transition-colors hover:text-foreground/60">
              Libraries
            </Link>
            <Link href="/#recent" className="text-foreground/80 transition-colors hover:text-foreground/60">
              New &amp; Popular
            </Link>
          </nav>
        </div>
        <Link
          href={user ? '/admin' : '/auth/login'}
          className={
            user
              ? 'flex size-8 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground'
              : 'rounded bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85'
          }
          aria-label={user ? 'Admin dashboard' : undefined}
        >
          {user ? (user.email?.[0] ?? 'A').toUpperCase() : 'Sign in'}
        </Link>
      </div>
    </HeaderShell>
  )
}
