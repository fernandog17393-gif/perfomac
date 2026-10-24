export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const friendships = await prisma.friendship.findMany({
    where: { status: 'accepted', OR: [{ senderId: session.user.id }, { receiverId: session.user.id }] },
    include: { sender: { select: { id: true, name: true, email: true, image: true } }, receiver: { select: { id: true, name: true, email: true, image: true } } },
  })
  const friends = friendships.map((f: any) => f.senderId === session?.user?.id ? f.receiver : f.sender)
  return NextResponse.json(friends)
}
