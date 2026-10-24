export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const reminders = await prisma.reminder.findMany({ where: { userId: session.user.id }, orderBy: { time: 'asc' } })
  return NextResponse.json(reminders)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { title, time } = await request.json()
  const reminder = await prisma.reminder.create({ data: { userId: session.user.id, title, time } })
  return NextResponse.json(reminder, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  await prisma.reminder.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
