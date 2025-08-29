import { prisma } from "$lib/server/db";
import {json} from '@sveltejs/kit'
import type { RequestEvent } from "@sveltejs/kit";

import {ResponseJson} from '../../types'
import {userSchema} from '$lib/server/schema'
import {createToken, verifyPassword} from '$lib/server/auth'

export const POST = async ({ request }: RequestEvent) => {

  const data = await request.json();
  console.log('request', data)

  const parsed = userSchema.safeParse(data)

  if (!parsed.success) {
    return json({error: parsed.error.issues, code: 200}, {status: 200})
  }

  const {userName, password} = parsed.data
  const user = await prisma.user.findUnique({
    where: {userName},
    select: {userName: true, password: true}
  })

  if (!user) {
    return ResponseJson(null, 400, '用户不存在')
  }

  const isPasswordValid = await verifyPassword(password, user.password)

  if (!isPasswordValid) {
    return ResponseJson(null, 400, '密码错误')
  }
  const token = await createToken({userName, password})

  return ResponseJson({
    user,
    token
  }, 200, '登录成功')
};