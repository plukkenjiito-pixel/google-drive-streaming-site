'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createLibrary, type ActionState } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function AddLibraryForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createLibrary, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <section
      aria-labelledby="add-library"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 id="add-library" className="text-lg font-semibold">
          Add a Drive folder
        </h2>
        <p className="text-sm text-muted-foreground">
          {'Share the folder as "Anyone with the link can view", then paste its link here. Subfolders are included.'}
        </p>
      </div>
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="folder">Folder link or ID</Label>
          <Input
            id="folder"
            name="folder"
            required
            placeholder="https://drive.google.com/drive/folders/…"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Library name</Label>
          <Input id="name" name="name" required maxLength={120} placeholder="Family movies" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" name="description" maxLength={1000} rows={2} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Adding & syncing…' : 'Add library'}
          </Button>
          {state && (
            <p
              role="status"
              className={cn('text-sm', state.ok ? 'text-primary' : 'text-destructive')}
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </section>
  )
}
