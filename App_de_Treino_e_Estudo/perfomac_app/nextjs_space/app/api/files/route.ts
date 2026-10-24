export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getFileUrl, deleteFile } from '@/lib/s3'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const action = url.searchParams.get('action')
  if (id && action === 'download') {
    const file = await prisma.uploadedFile.findFirst({ where: { id, userId: session.user.id } })
    if (!file) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    const fileUrl = await getFileUrl(file.cloudStoragePath, file.contentType, file.isPublic)
    return NextResponse.json({ url: fileUrl })
  }
  const files = await prisma.uploadedFile.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(files)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { fileName, contentType, cloudStoragePath, isPublic, size } = await request.json()
  const file = await prisma.uploadedFile.create({ data: { userId: session.user.id, fileName, contentType, cloudStoragePath, isPublic: isPublic ?? false, size: size ?? 0 } })
  return NextResponse.json(file, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  const file = await prisma.uploadedFile.findFirst({ where: { id, userId: session.user.id } })
  if (file) {
    await deleteFile(file.cloudStoragePath)
    await prisma.uploadedFile.delete({ where: { id } })
  }
  return NextResponse.json({ ok: true })
}
