export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const sessions = await prisma.studySession.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { subject, type, duration } = await request.json()
  const s = await prisma.studySession.create({ data: { userId: session.user.id, subject, type: type ?? 'ativo', duration: duration ?? 25 } })
  return NextResponse.json(s, { status: 201 })
}
