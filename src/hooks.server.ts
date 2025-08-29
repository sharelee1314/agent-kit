import type { Handle, RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { verifyToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.split(' ')[1];
		if (token) {
			const payload = await verifyToken(token);
			if (payload) {
				event.locals.user = payload;
			} else {
				event.locals.user = null;
			}
		}
	} else {
		event.locals.user = null;
	}

	// 2. 判断请求类型和路径
	const { pathname } = event.url;
	const isApiRequest = pathname.startsWith('/api');
	if (isApiRequest) {
		const notProtectedRoutes = ['/api/auth/login', '/api/auth/register']
		if (!notProtectedRoutes.includes(event.url.pathname)) {
			if (!event.locals.user) {
				return json({ code: 401, msg: 'Unauthorized', data: null }, { status: 401 });
			}
		}
	}

	const response = await resolve(event);

	return response;
};
