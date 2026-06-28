import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ADMIN_HINT_COOKIE } from '@/features/admin/admin-cookies'
import { requireAdminSession } from '@/lib/auth-session'

const sevenDays = 7 * 24 * 60 * 60

export const GET = async () => {
  const session = await requireAdminSession()
  if (!session) {
    redirect('/api/auth/signin/google?callbackUrl=/foladmin')
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_HINT_COOKIE, '1', {
    maxAge: sevenDays,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  redirect('/editor')
}
