export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { goalId, value, note } = await request.json()
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId: session.user.id } })
  if (!goal) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
  await prisma.goalProgress.create({ data: { goalId, userId: session.user.id, value, note } })
  const newCurrent = goal.current + value
  const completed = newCurrent >= goal.target
  await prisma.goal.update({ where: { id: goalId }, data: { current: newCurrent, completed } })
  return NextResponse.json({ ok: true, current: newCurrent, completed }, { status: 201 })
}
