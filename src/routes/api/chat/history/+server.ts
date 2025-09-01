import { prisma } from '$lib/server/db';
import type { RequestHandler } from '../$types';
import { json } from '@sveltejs/kit';

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get latest message
 *     responses:
 *       200:
 *         description: Latest message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

export const GET: RequestHandler = async ({ locals }) => {
	const { userId } = locals.user;
	const chatHistory = await prisma.chatHistory.findFirst({
		where: { userId: +userId },
		orderBy: { createdAt: 'desc' }
	});
	if (!chatHistory) {
		return json({ code: 400, msg: 'Chat history not found', data: null }, { status: 200 });
	}
	const parsed = JSON.parse(chatHistory.content);
	return json({ code: 200, msg: 'Chat history', data: parsed }, { status: 200 });
};
