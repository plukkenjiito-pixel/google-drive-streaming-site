import { auth } from '@/lib/auth'
import { DriveAuthError, getDriveFile, getGoogleAccessToken, isValidDriveId } from '@/lib/google'

const ALLOWED_SIZES = new Set(['w480', 'w1280', 'w1920'])

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const { fileId } = await params
  if (!isValidDriveId(fileId)) return new Response('Bad request', { status: 400 })

  const sizeParam = new URL(request.url).searchParams.get('size') ?? 'w480'
  const size = ALLOWED_SIZES.has(sizeParam) ? sizeParam : 'w480'

  try {
    const file = await getDriveFile(session.user.id, fileId)
    if (!file?.thumbnailLink) return new Response('Not found', { status: 404 })

    const token = await getGoogleAccessToken(session.user.id)
    const thumbUrl = file.thumbnailLink.replace(/=s\d+$/, `=${size}`)
    const upstream = await fetch(thumbUrl, { headers: { Authorization: `Bearer ${token}` } })
    if (!upstream.ok) return new Response('Not found', { status: 404 })

    return new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    if (error instanceof DriveAuthError) return new Response('Unauthorized', { status: 401 })
    throw error
  }
}
