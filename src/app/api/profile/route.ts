import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const complete = !!(user.profile?.bio && user.profile?.age && user.profile?.gender && user.name)
  return NextResponse.json({ complete, profile: user.profile })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized — not logged in' }, { status: 401 })
  }

  const { name, bio, age, gender } = await req.json()

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name: name || undefined },
      }),
      prisma.profile.update({
        where: { userId: user.id },
        data: {
          bio: bio || undefined,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
        },
      }),
    ])
  } catch (e) {
    console.error('Profile update error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
