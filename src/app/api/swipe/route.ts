import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SwipeDirection } from '@prisma/client'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { toUserId, direction } = await req.json()

  if (!toUserId || !['LIKE', 'NOPE'].includes(direction)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: me.id, toUserId } },
    update: { direction },
    create: { fromUserId: me.id, toUserId, direction: direction as SwipeDirection },
  })

  // Check for mutual match
  let match = false
  if (direction === 'LIKE') {
    const theirSwipe = await prisma.swipe.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: me.id } },
    })
    match = theirSwipe?.direction === 'LIKE'
  }

  return NextResponse.json({ ok: true, match })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.swipe.deleteMany({ where: { fromUserId: me.id } })

  return NextResponse.json({ ok: true })
}
