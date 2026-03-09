import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const formData = await req.formData()
  const files = formData.getAll('photos') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', user.id)
  await mkdir(uploadDir, { recursive: true })

  const existing = await prisma.photo.count({ where: { profileId: profile.id } })

  const created = await Promise.all(
    files.map(async (file, i) => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `${Date.now()}-${i}.${ext}`
      const filepath = path.join(uploadDir, filename)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)

      return prisma.photo.create({
        data: {
          profileId: profile.id,
          url: `/uploads/${user.id}/${filename}`,
          order: existing + i,
        },
      })
    })
  )

  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { photoId } = await req.json()
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  })
  if (!user?.profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, profileId: user.profile.id },
  })
  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  await prisma.photo.delete({ where: { id: photoId } })

  // Try to delete file (best effort)
  try {
    const { unlink } = await import('fs/promises')
    await unlink(path.join(process.cwd(), 'public', photo.url))
  } catch {}

  return NextResponse.json({ ok: true })
}
