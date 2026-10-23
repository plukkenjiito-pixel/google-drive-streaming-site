'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { signOut } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut()
          router.push('/')
          router.refresh()
        })
      }
    >
      Sign out
    </Button>
  )
}
