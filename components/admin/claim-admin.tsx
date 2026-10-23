'use client'

import { useActionState } from 'react'
import { claimAdmin, type ActionState } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'

export function ClaimAdmin() {
  const [state, action, pending] = useActionState<ActionState>(claimAdmin, null)

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">You are not an admin</h2>
      <p className="text-sm text-muted-foreground">
        The first account to claim admin access manages the catalog. If nobody has claimed it yet,
        you can claim it now.
      </p>
      <form action={action}>
        <Button type="submit" disabled={pending}>
          {pending ? 'Claiming…' : 'Claim admin access'}
        </Button>
      </form>
      {state && !state.ok && (
        <p role="status" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </section>
  )
}
