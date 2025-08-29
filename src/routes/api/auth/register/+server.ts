import {prisma} from '$lib/server/db'
import {json} from '@sveltejs/kit'
import {userSchema} from '$lib/server/schema'
import type {RequestEvent} from '@sveltejs/kit'

import {hashPassword} from '$lib/server/auth'

export const POST = async ({request}: RequestEvent) => {
  const data = await request.json()
  const parsed = userSchema.safeParse(data)

  if (!parsed.success) {
    return json({code: 400, msg: parsed.error.message, data: null}, {status: 200})
  }

  try {
    const {userName, password} = parsed.data
    const user = await prisma.user.create({
      data: {userName, password: await hashPassword(password)}
    })
    return json({code: 200, msg: '注册成功', data: user}, {status: 200})
  } catch (error) {
    return json({code: 500, msg: '注册失败', data: null}, {status: 200})
  }

 
}