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

  // IDs already swiped by current user
  const swiped = await prisma.swipe.findMany({
    where: { fromUserId: me.id },
    select: { toUserId: true },
  })
  const swipedIds = swiped.map((s) => s.toUserId)

  const cards = await prisma.user.findMany({
    where: {
      id: { not: me.id, notIn: swipedIds },
    },
    include: {
      profile: {
        include: { photos: { orderBy: { order: 'asc' } } },
      },
    },
    take: 20,
  })

  return NextResponse.json(cards)
}
