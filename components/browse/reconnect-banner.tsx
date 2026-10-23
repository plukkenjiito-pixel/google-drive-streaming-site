import { GoogleSignInButton } from '@/components/google-sign-in-button'

export function ReconnectBanner() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 pt-24 text-center">
      <h1 className="text-balance text-3xl font-bold">Reconnect Google Drive</h1>
      <p className="max-w-md text-pretty text-muted-foreground">
        Your Google session has expired or Drive access was revoked. Sign in again to keep
        streaming.
      </p>
      <div className="w-full max-w-xs">
        <GoogleSignInButton label="Reconnect Google" />
      </div>
    </section>
  )
}
