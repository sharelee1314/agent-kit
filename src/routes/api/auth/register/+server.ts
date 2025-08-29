import {prisma} from '$lib/server/db'
import {ResponseJson} from '../../types'
import {userSchema} from '$lib/server/schema'
import type {RequestEvent} from '@sveltejs/kit'

import {hashPassword} from '$lib/server/auth'

export const POST = async ({request}: RequestEvent) => {
  const data = await request.json()
  const parsed = userSchema.safeParse(data)

  if (!parsed.success) {
    return ResponseJson(null, 400, parsed.error.message)
  }

  try {
    const {userName, password} = parsed.data
    const user = await prisma.user.create({
      data: {userName, password: await hashPassword(password)}
    })
    return ResponseJson(user, 200, '注册成功')
  } catch (error) {
    return ResponseJson(null, 500, '注册失败')
  }

 
}