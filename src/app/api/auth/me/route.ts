import { NextRequest } from 'next/server'
import { getCurrentUser, apiSuccess, apiUnauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiUnauthorized()
  return apiSuccess(user)
}
