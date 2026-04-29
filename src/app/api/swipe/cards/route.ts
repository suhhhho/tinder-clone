import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET() {
  const me = await requireUser()
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cards = await prisma.user.findMany({
    where: {
      id: { not: me.id },
      swipesGot: { none: { fromUserId: me.id } },
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
