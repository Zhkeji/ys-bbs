import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser, apiSuccess, apiError, apiUnauthorized } from '@/lib/auth'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'images' // avatars, images, attachments

    if (!file) return apiError('请选择文件')

    const maxSize = type === 'avatars' ? 2 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) return apiError(`文件大小不能超过${maxSize / 1024 / 1024}MB`)

    const allowedTypes: Record<string, string[]> = {
      avatars: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      attachments: ['application/pdf', 'application/zip', 'application/x-rar', 'text/plain',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'audio/mpeg'],
    }

    if (!allowedTypes[type]?.includes(file.type)) {
      return apiError('不支持的文件类型')
    }

    const ext = file.name.split('.').pop()
    const filename = `${uuid()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', type)

    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(join(uploadDir, filename), Buffer.from(bytes))

    return apiSuccess({
      url: `/uploads/${type}/${filename}`,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return apiError('上传失败', 500)
  }
}
