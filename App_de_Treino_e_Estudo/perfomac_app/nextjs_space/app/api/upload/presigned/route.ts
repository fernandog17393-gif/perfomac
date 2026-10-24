export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generatePresignedUploadUrl } from '@/lib/s3'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { fileName, contentType, isPublic } = await request.json()
  const result = await generatePresignedUploadUrl(fileName, contentType, isPublic ?? false)
  return NextResponse.json(result)
}
