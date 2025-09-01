import type { RequestHandler } from './$types';
import {z} from 'zod';
import { json } from '@sveltejs/kit';
import {prisma} from '$lib/server/db';


export const POST: RequestHandler = async ({ request, locals }) => {
	const data = await request.json();
	const schema = z.object({
     content:  z.array(
      z.object({
        role: z.string(),
        content: z.string(),
        timestamp: z.iso.datetime()
      })
    )
  })
   
	const parsed = schema.safeParse(data);
	if (!parsed.success) {
		return json({
      code: 400,
      msg: 'Invalid chat',
      data: null
    }, { status: 200 });
	}
  const { userId } = locals.user
  const chatHistory = parsed.data;
  const result = await prisma.chatHistory.create({
    data: {
      userId: +userId,
      content: JSON.stringify(chatHistory)
    }
  });
	return json({code: 200, msg: 'Chat saved', data: result}, { status: 200 });
};