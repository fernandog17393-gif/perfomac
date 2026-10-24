import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash('eVmz*S8XWu', 12)
  await prisma.user.upsert({
    where: { email: 'abacus-c3a3de09@example.com' },
    update: {},
    create: {
      email: 'abacus-c3a3de09@example.com',
      name: 'Admin',
      password: hashedPassword,
    },
  })
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
