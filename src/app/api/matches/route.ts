import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET() {
  const me = await requireUser()
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // IDs I liked
  const myLikes = await prisma.swipe.findMany({
    where: { fromUserId: me.id, direction: 'LIKE' },
    select: { toUserId: true },
  })
  const myLikedIds = myLikes.map((s) => s.toUserId)

  // Incoming likes from users that I already liked.
  const reciprocalLikes = await prisma.swipe.findMany({
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

  const matches = reciprocalLikes.map((s) => s.fromUser)
  return NextResponse.json(matches)
}
