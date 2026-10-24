export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const tasks = await prisma.task.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { title, dueDate, priority } = await request.json()
  const task = await prisma.task.create({ data: { userId: session.user.id, title, dueDate: dueDate ? new Date(dueDate) : null, priority: priority ?? 'medium' } })
  return NextResponse.json(task, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, ...data } = await request.json()
  const task = await prisma.task.updateMany({ where: { id, userId: session.user.id }, data })
  return NextResponse.json(task)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  await prisma.task.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
