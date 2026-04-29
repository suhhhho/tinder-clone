import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const AUTO_REPLIES = [
  'Haha fair point 😄',
  'Love that energy!',
  'That sounds fun, tell me more 👀',
  'I am into that idea',
  'Nice! What are you up to today?',
  'You seem cool already 😌',
  'I would definitely do that',
  'Okay wait, now I am curious',
]

function pickAutoReply(input: string) {
  const text = input.toLowerCase().trim()
  if (text.includes('?')) {
    return 'Good question 😄 what do you think?'
  }
  if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    return 'Hey you 👋 nice to chat with you!'
  }
  if (text.includes('coffee')) {
    return 'Coffee date sounds perfect ☕'
  }
  if (text.includes('music')) {
    return 'Now we are talking. What is on your playlist? 🎵'
  }
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
}

// GET  /api/messages/[matchId]  — fetch conversation
export async function GET(_req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { matchId } = await params

  // Verify mutual match before allowing messages
  const iLikedThem = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: me.id, toUserId: matchId } },
  })
  const theyLikedMe = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: matchId, toUserId: me.id } },
  })
  if (iLikedThem?.direction !== 'LIKE' || theyLikedMe?.direction !== 'LIKE') {
    return NextResponse.json({ error: 'Not a match' }, { status: 403 })
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: me.id, toUserId: matchId },
        { fromUserId: matchId, toUserId: me.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      body: true,
      fromUserId: true,
      createdAt: true,
    },
  })

  const matchUser = await prisma.user.findUnique({
    where: { id: matchId },
    include: {
      profile: {
        include: { photos: { orderBy: { order: 'asc' } } },
      },
    },
  })

  return NextResponse.json({ messages, myId: me.id, matchUser })
}

// POST /api/messages/[matchId]  — send a message
export async function POST(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { matchId } = await params
  const { body } = await req.json()

  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }
  if (body.length > 1000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  // Verify mutual match
  const iLikedThem = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: me.id, toUserId: matchId } },
  })
  const theyLikedMe = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: matchId, toUserId: me.id } },
  })
  if (iLikedThem?.direction !== 'LIKE' || theyLikedMe?.direction !== 'LIKE') {
    return NextResponse.json({ error: 'Not a match' }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: { fromUserId: me.id, toUserId: matchId, body: body.trim() },
  })

  // Test helper: auto-reply as the matched user to keep chat active.
  await prisma.message.create({
    data: {
      fromUserId: matchId,
      toUserId: me.id,
      body: pickAutoReply(body),
    },
  })

  return NextResponse.json(message)
}
