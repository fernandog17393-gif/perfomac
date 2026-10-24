export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const requests = await prisma.friendship.findMany({
    where: { status: 'pending', OR: [{ senderId: session.user.id }, { receiverId: session.user.id }] },
    include: { sender: { select: { id: true, name: true, email: true, image: true } }, receiver: { select: { id: true, name: true, email: true, image: true } } },
  })
  return NextResponse.json(requests)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { email } = await request.json()
  const target = await prisma.user.findUnique({ where: { email } })
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  if (target.id === session.user.id) return NextResponse.json({ error: 'Não pode adicionar a si mesmo.' }, { status: 400 })
  const existing = await prisma.friendship.findFirst({ where: { OR: [{ senderId: session.user.id, receiverId: target.id }, { senderId: target.id, receiverId: session.user.id }] } })
  if (existing) return NextResponse.json({ error: 'Solicitação já existe.' }, { status: 409 })
  const friendship = await prisma.friendship.create({ data: { senderId: session.user.id, receiverId: target.id } })
  return NextResponse.json(friendship, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, status } = await request.json()
  if (!['accepted', 'rejected'].includes(status)) return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  await prisma.friendship.updateMany({ where: { id, receiverId: session.user.id, status: 'pending' }, data: { status } })
  return NextResponse.json({ ok: true })
}
