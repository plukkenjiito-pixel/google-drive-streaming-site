import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function AuthErrorPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex justify-center px-4 py-16">
        <div className="flex max-w-sm flex-col gap-2 rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Sign-in link failed</h1>
          <p className="text-sm text-muted-foreground">
            The link may have expired.{' '}
            <Link href="/auth/login" className="text-foreground underline underline-offset-4">
              Try signing in again
            </Link>
            .
          </p>
        </div>
      </main>
    </>
  )
}
