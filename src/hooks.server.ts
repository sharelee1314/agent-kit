import type { Handle, RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

import { verifyToken } from '$lib/server/auth';

import { ResponseJson } from './routes/api/types';

export const handle: Handle = async ({ event, resolve }) => {
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.split(' ')[1];
		const payload = await verifyToken(token);
		if (payload) {
			event.locals.user = payload;
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
				return ResponseJson(null, 401, 'Unauthorized');
			}
		}
	}

	const response = await resolve(event);

	return response;
};
