export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'E-mail e senha (mín. 6 chars) são obrigatórios.' }, { status: 400 })
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
    }
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (err: any) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
