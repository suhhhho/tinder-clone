import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { z } from 'zod'

const profilePatchSchema = z.object({
  name: z.string().trim().min(1).max(80).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  age: z
    .preprocess(
      (value) => {
        if (value === '' || value === null || value === undefined) return value
        if (typeof value === 'string') return Number(value)
        return value
      },
      z.number().int().min(18).max(120).nullable().optional()
    ),
  gender: z.enum(['Man', 'Woman', 'Other']).nullable().optional(),
})

export async function GET() {
  const me = await requireUser()
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: me.id },
    include: { profile: { include: { photos: { orderBy: { order: 'asc' } } } } },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const complete = !!(user.profile?.bio && user.profile?.age && user.profile?.gender && user.name)
  return NextResponse.json({
    complete,
    name: user.name,
    profile: user.profile,
    photos: user.profile?.photos ?? [],
  })
}

export async function PATCH(req: Request) {
  const me = await requireUser()
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized — not logged in' }, { status: 401 })
  }

  const parsed = profilePatchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 })
  }

  const { name, bio, age, gender } = parsed.data

  try {
    const userData: { name?: string | null } = {}
    if (name !== undefined) userData.name = name

    const profileData: { bio?: string | null; age?: number | null; gender?: string | null } = {}
    if (bio !== undefined) profileData.bio = bio
    if (age !== undefined) profileData.age = age
    if (gender !== undefined) profileData.gender = gender

    await prisma.$transaction([
      prisma.user.update({
        where: { id: me.id },
        data: userData,
      }),
      prisma.profile.update({
        where: { userId: me.id },
        data: profileData,
      }),
    ])
  } catch (e) {
    console.error('Profile update error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
