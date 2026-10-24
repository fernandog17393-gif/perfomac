export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const workouts = await prisma.workout.findMany({ where: { userId: session.user.id }, include: { exercises: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(workouts)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { name, type, exercises } = await request.json()
  const workout = await prisma.workout.create({
    data: { userId: session.user.id, name, type: type ?? 'academia', exercises: { create: (exercises ?? []).map((ex: any) => ({ name: ex.name, sets: ex.sets ?? 3, reps: ex.reps ?? 12, weight: ex.weight })) } },
    include: { exercises: true },
  })
  return NextResponse.json(workout, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, ...data } = await request.json()
  await prisma.workout.updateMany({ where: { id, userId: session.user.id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  await prisma.workout.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
