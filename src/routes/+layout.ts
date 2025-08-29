import { logout } from '$lib/stores/auth';

export const ssr = false; // 禁用服务端渲染，因为需要访问localStorage


// 重写全局 fetch 处理401
const originalFetch = window.fetch;
window.fetch = async function (...args) {
	const response = await originalFetch(...args);

	if (response.status === 401) {
		// 触发登出
		logout()
	}

	return response;
};


