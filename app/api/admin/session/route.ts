import { cookies } from 'next/headers'

import { ADMIN_HINT_COOKIE } from '@/features/admin/admin-cookies'
import { requireAdminSession } from '@/lib/auth-session'

export const GET = async () => {
  const session = await requireAdminSession()
  const cookieStore = await cookies()

  if (!session) {
    cookieStore.delete(ADMIN_HINT_COOKIE)
    return Response.json({ authenticated: false })
  }

  return Response.json({ authenticated: true })
}
