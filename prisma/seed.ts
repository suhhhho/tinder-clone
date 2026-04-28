import { PrismaClient, SwipeDirection } from '@prisma/client'

const prisma = new PrismaClient()

// randomuser.me portraits: women/0-99, men/0-99
const people = [
  { name: 'Emma Johnson',    email: 'emma.johnson@example.com',    bio: "Coffee lover ☕ | Hiking enthusiast 🏔️",  photos: ['women/1','women/2','women/3'] },
  { name: 'Liam Smith',      email: 'liam.smith@example.com',      bio: "Foodie & amateur chef 🍕 | Dog dad 🐶",   photos: ['men/1','men/2'] },
  { name: 'Olivia Brown',    email: 'olivia.brown@example.com',    bio: "Yoga every morning 🧘 | Travel addict ✈️", photos: ['women/4','women/5','women/6','women/7'] },
  { name: 'Noah Davis',      email: 'noah.davis@example.com',      bio: "Gym rat 💪 | Big on sunsets 🌅",           photos: ['men/3','men/4','men/5'] },
  { name: 'Ava Wilson',      email: 'ava.wilson@example.com',      bio: "Book nerd 📚 | Cat mom 🐱",               photos: ['women/8','women/9'] },
  { name: 'Elijah Martinez', email: 'elijah.martinez@example.com', bio: "Musician 🎸 | Night owl 🦉",              photos: ['men/6','men/7','men/8'] },
  { name: 'Sophia Anderson', email: 'sophia.anderson@example.com', bio: "Art & design 🎨 | Brunch always 🥂",       photos: ['women/10','women/11','women/12'] },
  { name: 'James Taylor',    email: 'james.taylor@example.com',    bio: "Surfer 🏄 | Tech geek 💻",               photos: ['men/9','men/10'] },
  { name: 'Isabella Thomas', email: 'isabella.thomas@example.com', bio: "Dancing through life 💃 | Pasta > everything 🍝", photos: ['women/13','women/14','women/15'] },
  { name: 'Lucas Garcia',    email: 'lucas.garcia@example.com',    bio: "Explorer by nature 🌍 | Iced coffee daily ☕", photos: ['men/11','men/12','men/13'] },
  { name: 'Mia Robinson',    email: 'mia.robinson@example.com',    bio: "Sunsets & good vibes 🌅 | Pilates addict",  photos: ['women/16','women/17'] },
  { name: 'Ethan Clark',     email: 'ethan.clark@example.com',     bio: "Basketball 🏀 | Weekend camper ⛺",        photos: ['men/14','men/15','men/16'] },
  { name: 'Charlotte Lewis', email: 'charlotte.lewis@example.com', bio: "Pastry chef in training 🥐 | Wine lover 🍷", photos: ['women/18','women/19','women/20'] },
  { name: 'Mason Lee',       email: 'mason.lee@example.com',       bio: "Photography 📸 | Mountains > beaches 🏔️",  photos: ['men/17','men/18'] },
  { name: 'Amelia Walker',   email: 'amelia.walker@example.com',   bio: "Spontaneous road trips 🚗 | Kombucha daily", photos: ['women/21','women/22','women/23'] },
  { name: 'Logan Hall',      email: 'logan.hall@example.com',      bio: "Startup life 🚀 | Espresso shots ☕",       photos: ['men/19','men/20','men/21'] },
  { name: 'Harper Allen',    email: 'harper.allen@example.com',    bio: "Theatre kid grown up 🎭 | NYC dreamer",     photos: ['women/24','women/25'] },
  { name: 'Jackson Young',   email: 'jackson.young@example.com',   bio: "Rock climber 🧗 | Vinyl collector 🎵",      photos: ['men/22','men/23','men/24'] },
  { name: 'Evelyn Hernandez',email: 'evelyn.hernandez@example.com',bio: "Bookshop hopper 📖 | Golden hour obsessed",  photos: ['women/26','women/27','women/28'] },
  { name: 'Sebastian King',  email: 'sebastian.king@example.com',  bio: "Chef 👨‍🍳 | Scuba diver 🤿 | Terrible dancer", photos: ['men/25','men/26'] },
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  // Create users with profiles and photos
  const created = await Promise.all(
    people.map(({ name, email, bio, photos }) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name,
          profile: {
            create: {
              bio,
              photos: {
                create: photos.map((portrait, j) => ({
                  url: `https://randomuser.me/api/portraits/${portrait}.jpg`,
                  order: j,
                })),
              },
            },
          },
        },
      })
    )
  )

  console.log(`Upserted ${created.length} users with profiles and photos`)

  // Seed swipes between all users
  const users = await prisma.user.findMany()
  const directions = [SwipeDirection.LIKE, SwipeDirection.NOPE]
  let swipeCount = 0

  // Pairs that are guaranteed to be mutual LIKEs (indices into `users`)
  // This ensures every account has visible matches for testing
  const guaranteedMatches: [number, number][] = [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 4],
    [2, 5], [3, 6],
    [4, 7], [5, 8],
  ]
  const guaranteedSet = new Set(
    guaranteedMatches.flatMap(([a, b]) => [
      `${users[a]?.id}:${users[b]?.id}`,
      `${users[b]?.id}:${users[a]?.id}`,
    ])
  )

  for (const fromUser of users) {
    for (const toUser of users) {
      if (fromUser.id === toUser.id) continue
      const isGuaranteed = guaranteedSet.has(`${fromUser.id}:${toUser.id}`)
      await prisma.swipe.upsert({
        where: { fromUserId_toUserId: { fromUserId: fromUser.id, toUserId: toUser.id } },
        update: {},
        create: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
          direction: isGuaranteed ? SwipeDirection.LIKE : directions[randomInt(0, 1)],
        },
      })
      swipeCount++
    }
  }

  console.log(`Upserted ${swipeCount} swipes (including guaranteed mutual matches)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
