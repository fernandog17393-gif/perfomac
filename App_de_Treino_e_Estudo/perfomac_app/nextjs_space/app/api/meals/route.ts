export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const meals = await prisma.meal.findMany({ where: { userId: session.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(meals)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { name, time, items } = await request.json()
  const meal = await prisma.meal.create({
    data: { userId: session.user.id, name, time, items: { create: (items ?? []).map((it: any) => ({ name: it.name, quantity: it.quantity || null, calories: it.calories })) } },
    include: { items: true },
  })
  return NextResponse.json(meal, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  await prisma.meal.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
