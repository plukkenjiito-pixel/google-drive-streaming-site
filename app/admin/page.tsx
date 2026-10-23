import { redirect } from 'next/navigation'
import { getAdminState } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { AddLibraryForm } from '@/components/admin/add-library-form'
import { LibraryRow } from '@/components/admin/library-row'
import { ClaimAdmin } from '@/components/admin/claim-admin'
import { SignOutButton } from '@/components/admin/sign-out-button'
import type { Library } from '@/lib/catalog'

export const metadata = { title: 'Admin · DriveFlix' }

export default async function AdminPage() {
  const { supabase, user, isAdmin } = await getAdminState()
  if (!user) redirect('/auth/login')

  const hasDriveKey = Boolean(process.env.GOOGLE_DRIVE_API_KEY)
  const { data: libraries } = isAdmin
    ? await supabase.from('libraries').select('*').order('created_at', { ascending: false })
    : { data: [] }
  const { data: videoRows } = isAdmin
    ? await supabase.from('videos').select('library_id').limit(5000)
    : { data: [] }
  const counts = new Map<string, number>()
  for (const row of videoRows ?? []) counts.set(row.library_id, (counts.get(row.library_id) ?? 0) + 1)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {!isAdmin ? (
          <ClaimAdmin />
        ) : (
          <>
            {!hasDriveKey && (
              <div
                role="alert"
                className="rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm leading-relaxed"
              >
                <strong className="font-medium">Google Drive API key missing.</strong> Add{' '}
                <code className="font-mono">GOOGLE_DRIVE_API_KEY</code> in the Vars section of
                project settings so folders can be synced.
              </div>
            )}
            <AddLibraryForm />
            <section aria-labelledby="libs" className="flex flex-col gap-3">
              <h2 id="libs" className="text-lg font-semibold">
                Libraries
              </h2>
              {(libraries ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No libraries yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
                  {(libraries as Library[]).map((lib) => (
                    <LibraryRow key={lib.id} library={lib} count={counts.get(lib.id) ?? 0} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  )
}
