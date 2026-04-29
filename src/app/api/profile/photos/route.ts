import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_PHOTOS_PER_PROFILE = 6
const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const formData = await req.formData()
  const files = formData.getAll('photos').filter((entry): entry is File => entry instanceof File)

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  if (files.some((file) => !ALLOWED_MIME_TYPES[file.type])) {
    return NextResponse.json(
      { error: 'Only JPG, PNG, and WEBP images are allowed' },
      { status: 400 }
    )
  }

  if (files.some((file) => file.size <= 0 || file.size > MAX_FILE_BYTES)) {
    return NextResponse.json(
      { error: 'Each image must be between 1 byte and 5MB' },
      { status: 400 }
    )
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', user.id)
  await mkdir(uploadDir, { recursive: true })

  const existing = await prisma.photo.count({ where: { profileId: profile.id } })
  if (existing + files.length > MAX_PHOTOS_PER_PROFILE) {
    return NextResponse.json(
      { error: `You can have at most ${MAX_PHOTOS_PER_PROFILE} photos` },
      { status: 400 }
    )
  }

  const created = await Promise.all(
    files.map(async (file, i) => {
      const ext = ALLOWED_MIME_TYPES[file.type]
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
  const user = await requireUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { photoId } = await req.json()
  const fullUser = await prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } })
  if (!fullUser?.profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, profileId: fullUser.profile.id },
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
