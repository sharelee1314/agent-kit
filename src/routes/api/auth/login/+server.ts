import { prisma } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { userSchema } from '$lib/server/schema';
import { createToken, verifyPassword } from '$lib/server/auth';

export const POST = async ({ request }: RequestEvent) => {
	const data = await request.json();

	const parsed = userSchema.safeParse(data);

	if (!parsed.success) {
		return json({ error: parsed.error.issues, code: 200, data: null }, { status: 200 });
	}

	const { userName, password } = parsed.data;
	const user = await prisma.user.findUnique({
		where: { userName },
		select: { userName: true, password: true }
	});

	if (!user) {
		return json({ code: 400, msg: '用户不存在', data: null }, { status: 200 });
	}

	const isPasswordValid = await verifyPassword(password, user.password);

	if (!isPasswordValid) {
		return json({ code: 400, msg: '密码错误' }, { status: 200 });
	}
	const token = await createToken({ userName, password });

	return json(
		{
			code: 200,
			msg: '登录成功',
			data: { user, token }
		},
		{ status: 200 }
	);
};
