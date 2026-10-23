'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, FolderCog } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

type NavbarProps = { user: { name: string; email: string; image?: string | null } }

const links = [
  { href: '/', label: 'Home' },
  { href: '/folders', label: 'My Folders' },
]

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-background' : 'bg-gradient-to-b from-black/80 to-transparent',
      )}
    >
      <nav className="flex h-16 items-center gap-6 px-4 md:h-[68px] md:px-12" aria-label="Main">
        <BrandLogo />
        <ul className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={cn(
                  'transition-colors hover:text-muted-foreground',
                  pathname === link.href ? 'font-semibold text-foreground' : 'text-foreground/80',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-md"
          >
            {user.image ? (
              <img
                src={user.image || '/placeholder.svg'}
                alt=""
                referrerPolicy="no-referrer"
                className="size-8 rounded-md object-cover"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="sr-only">Open account menu</span>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-60 rounded-md border border-border bg-popover/95 py-2 text-sm shadow-xl backdrop-blur"
            >
              <div className="border-b border-border px-4 pb-3 pt-1">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Link
                role="menuitem"
                href="/folders"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent"
              >
                <FolderCog className="size-4" aria-hidden="true" />
                Manage folders
              </Link>
              <button
                role="menuitem"
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-accent"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
