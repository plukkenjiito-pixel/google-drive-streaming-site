'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function friendlyError(code: string | undefined, status: number | undefined, mode: 'login' | 'sign-up') {
  if (code === 'email_not_confirmed') return 'Please confirm your email before signing in.'
  if (code === 'weak_password') return 'Password is too weak. Use at least 8 characters.'
  if (status === 429 || code?.startsWith('over_')) return 'Too many attempts. Please wait and try again.'
  if (mode === 'login' && (code === 'invalid_credentials' || status === 400))
    return 'Invalid email or password.'
  if (code === 'email_address_invalid') return 'Please use a valid email address.'
  return 'Something went wrong. Please try again.'
}

export function AuthForm({ mode }: { mode: 'login' | 'sign-up' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) return setError(friendlyError(error.code, error.status, mode))
      router.push('/admin')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      setLoading(false)
      if (error) return setError(friendlyError(error.code, error.status, mode))
      router.push('/auth/sign-up-success')
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? 'Admin sign in' : 'Create admin account'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin ? 'Manage your Drive libraries.' : 'The first account can claim admin access.'}
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={isLogin ? undefined : 8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Sign up'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? 'No account yet? ' : 'Already have an account? '}
        <Link
          href={isLogin ? '/auth/sign-up' : '/auth/login'}
          className="text-foreground underline underline-offset-4"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </Link>
      </p>
    </div>
  )
}
