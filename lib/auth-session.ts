import 'server-only'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/auth'
import { isAdminEmail } from '@/features/admin/admin-emails'

export const getAdminSession = () => getServerSession(authOptions)

export const requireAdminSession = async () => {
  const session = await getAdminSession()
  const email = session?.user?.email
  if (!isAdminEmail(email, process.env.ADMIN_EMAILS)) return null
  return session
}
