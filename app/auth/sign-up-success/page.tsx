import { SiteHeader } from '@/components/site-header'

export default function SignUpSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex justify-center px-4 py-16">
        <div className="flex max-w-sm flex-col gap-2 rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent you a confirmation link. Open it to activate your account, then sign in.
          </p>
        </div>
      </main>
    </>
  )
}
