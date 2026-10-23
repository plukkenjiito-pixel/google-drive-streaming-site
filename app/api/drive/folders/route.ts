import { auth } from '@/lib/auth'
import { DriveAuthError, isValidDriveId, listDriveFolders } from '@/lib/google'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const parent = new URL(request.url).searchParams.get('parent') ?? 'root'
  if (parent !== 'root' && parent !== 'shared' && !isValidDriveId(parent)) {
    return Response.json({ error: 'Invalid folder' }, { status: 400 })
  }

  try {
    const folders = await listDriveFolders(session.user.id, parent)
    return Response.json({ folders })
  } catch (error) {
    if (error instanceof DriveAuthError) {
      return Response.json({ error: 'Please reconnect your Google account' }, { status: 401 })
    }
    console.error('Drive folder listing failed', error)
    return Response.json({ error: 'Unable to load folders' }, { status: 500 })
  }
}
