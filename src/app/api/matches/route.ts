import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // IDs I liked
  const myLikes = await prisma.swipe.findMany({
    where: { fromUserId: me.id, direction: 'LIKE' },
    select: { toUserId: true },
  })
  const myLikedIds = myLikes.map((s) => s.toUserId)

  // Among those, who also liked me back?
  const mutualSwipes = await prisma.swipe.findMany({
    where: {
      fromUserId: { in: myLikedIds },
      toUserId: me.id,
      direction: 'LIKE',
    },
    include: {
      fromUser: {
        include: {
          profile: { include: { photos: { orderBy: { order: 'asc' } } } },
        },
      },
    },
  })

  const matches = mutualSwipes.map((s) => s.fromUser)
  return NextResponse.json(matches)
}
