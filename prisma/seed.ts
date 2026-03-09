import { PrismaClient, SwipeDirection } from '@prisma/client'

const prisma = new PrismaClient()

const people = [
  { name: 'Emma Johnson',   email: 'emma.johnson@example.com',   bio: "Coffee lover ☕ | Hiking enthusiast 🏔️" },
  { name: 'Liam Smith',     email: 'liam.smith@example.com',     bio: "Foodie & amateur chef 🍕 | Dog dad 🐶" },
  { name: 'Olivia Brown',   email: 'olivia.brown@example.com',   bio: "Yoga every morning 🧘 | Travel addict ✈️" },
  { name: 'Noah Davis',     email: 'noah.davis@example.com',     bio: "Gym rat 💪 | Big on sunsets 🌅" },
  { name: 'Ava Wilson',     email: 'ava.wilson@example.com',     bio: "Book nerd 📚 | Cat mom 🐱" },
  { name: 'Elijah Martinez',email: 'elijah.martinez@example.com',bio: "Musician 🎸 | Night owl 🦉" },
  { name: 'Sophia Anderson',email: 'sophia.anderson@example.com',bio: "Art & design enthusiast 🎨 | Brunch always 🥂" },
  { name: 'James Taylor',   email: 'james.taylor@example.com',   bio: "Surfer 🏄 | Tech geek 💻" },
  { name: 'Isabella Thomas',email: 'isabella.thomas@example.com',bio: "Dancing through life 💃 | Pasta > everything 🍝" },
  { name: 'Lucas Garcia',   email: 'lucas.garcia@example.com',   bio: "Explorer by nature 🌍 | Iced coffee daily ☕" },
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.log('No users found. Run the user seed first.')
    return
  }

  const directions = [SwipeDirection.LIKE, SwipeDirection.NOPE]
  let swipeCount = 0

  for (const fromUser of users) {
    for (const toUser of users) {
      if (fromUser.id === toUser.id) continue

      await prisma.swipe.upsert({
        where: { fromUserId_toUserId: { fromUserId: fromUser.id, toUserId: toUser.id } },
        update: {},
        create: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
          direction: directions[randomInt(0, 1)],
        },
      })
      swipeCount++
    }
  }

  console.log(`Created ${swipeCount} swipes between ${users.length} users`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
