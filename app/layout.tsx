import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'StreamHive — Your Google Drive, as a streaming service',
  description:
    'Sign in with Google, pick your Drive folders, and stream your personal video library in a cinematic interface.',
}

export const viewport: Viewport = {
  themeColor: '#141414',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
