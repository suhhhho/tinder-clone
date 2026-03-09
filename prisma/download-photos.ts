import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const profiles = await prisma.profile.findMany({
    include: { photos: { orderBy: { order: 'asc' } }, user: true },
  })

  console.log(`Updating photos for ${profiles.length} profiles…`)

  for (const profile of profiles) {
    // Fetch one random person portrait
    const apiRes = await fetch('https://randomuser.me/api/?inc=picture', { cache: 'no-store' } as RequestInit)
    const apiData = await apiRes.json()
    const newUrl: string = apiData.results[0].picture.large

    // Delete all existing photos for this profile
    await prisma.photo.deleteMany({ where: { profileId: profile.id } })

    // Create a single photo
    await prisma.photo.create({ data: { profileId: profile.id, url: newUrl, order: 0 } })

    console.log(`  ✓ ${profile.user.name} → ${newUrl}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
