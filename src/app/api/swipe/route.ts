import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { SwipeDirection } from '@prisma/client'

export async function POST(req: Request) {
  const me = await requireUser()
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { toUserId, direction } = await req.json()

  if (!toUserId || !['LIKE', 'NOPE'].includes(direction)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const existingSwipe = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: me.id, toUserId } },
    select: { id: true },
  })
  if (existingSwipe) {
    return NextResponse.json({ error: 'Already swiped on this user' }, { status: 409 })
  }

  await prisma.swipe.create({
    data: { fromUserId: me.id, toUserId, direction: direction as SwipeDirection },
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
  const me = await requireUser()
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.swipe.deleteMany({ where: { fromUserId: me.id } })

  return NextResponse.json({ ok: true })
}
