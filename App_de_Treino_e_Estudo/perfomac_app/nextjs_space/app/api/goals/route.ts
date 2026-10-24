export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const goals = await prisma.goal.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(goals)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { title, description, target, unit, deadline, isPublic } = await request.json()
  const goal = await prisma.goal.create({ data: { userId: session.user.id, title, description, target: target ?? 100, unit: unit ?? '%', deadline: deadline ? new Date(deadline) : null, isPublic: isPublic ?? false } })
  return NextResponse.json(goal, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, ...data } = await request.json()
  if (data.deadline) data.deadline = new Date(data.deadline)
  await prisma.goal.updateMany({ where: { id, userId: session.user.id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  await prisma.goal.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
