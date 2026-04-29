import { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
  image: string | null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user?.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function requireUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions)
  const id = session?.user?.id
  if (!id) return null

  return {
    id,
    email: session.user?.email ?? null,
    name: session.user?.name ?? null,
    image: session.user?.image ?? null,
  }
}
