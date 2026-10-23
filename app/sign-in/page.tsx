import { redirect } from 'next/navigation'
import { FolderCheck, HardDrive, PlayCircle } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { getSession } from '@/lib/session'

export const metadata = { title: 'Sign in — StreamHive' }

const features = [
  { icon: HardDrive, text: 'Connect your Google Drive securely (read-only)' },
  { icon: FolderCheck, text: 'Tick the folders you want in your library' },
  { icon: PlayCircle, text: 'Stream and resume your videos anywhere' },
]

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) redirect('/')

  return (
    <main className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/signin-bg.png)' }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"
      />

      <header className="relative z-10 px-6 py-6 md:px-12">
        <BrandLogo />
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-md bg-black/75 p-8 md:p-12">
          <h1 className="text-balance text-3xl font-bold">Your Drive. Your cinema.</h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Sign in with your Google account to turn your Drive videos into a personal streaming
            library.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <GoogleSignInButton />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            {"We only request read-only access to your Drive. Your files are streamed directly from Google and never stored on our servers."}
          </p>
        </div>
      </section>
    </main>
  )
}
