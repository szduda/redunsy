import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { isAdminEmail } from '@/features/admin/admin-emails'

const sevenDays = 7 * 24 * 60 * 60

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: sevenDays,
    updateAge: 0,
  },
  callbacks: {
    signIn: ({ user }) => {
      const email = user.email?.toLowerCase() ?? 'unknown'

      if (!user.email) {
        console.warn('[auth] sign-in failed: missing email from Google profile')
        return false
      }

      if (!isAdminEmail(user.email, process.env.ADMIN_EMAILS)) {
        console.warn(`[auth] sign-in rejected: ${email} is not in ADMIN_EMAILS`)
        return false
      }

      console.info(`[auth] sign-in success: ${email}`)
      return true
    },
    jwt: ({ token, user }) => {
      if (user?.email) token.email = user.email
      return token
    },
    session: ({ session, token }) => {
      if (session.user && token.email) session.user.email = token.email as string
      return session
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
}
