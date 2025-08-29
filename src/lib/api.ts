import { browser } from '$app/environment';

import { logout } from '$lib/stores/auth';

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

class ApiClient {
	private baseURL = '';

	async request(url: string, options: RequestInit = {}) {
		const token = browser ? localStorage.getItem('token') : null;

		const config: RequestInit = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers
			}
		};

		const response = await fetch(this.baseURL + url, config);

		const resData = await response.json();

		if (resData.code === 200) {
			return resData.data;
		} else {
			throw new Error(resData.msg);
		}
	}

	async get(url: string, options?: RequestInit) {
		return this.request(url, { ...options, method: 'GET' });
	}

	async post(url: string, data?: any, options?: RequestInit) {
		return this.request(url, {
			...options,
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async put(url: string, data?: any, options?: RequestInit) {
		return this.request(url, {
			...options,
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async delete(url: string, options?: RequestInit) {
		return this.request(url, { ...options, method: 'DELETE' });
	}
}

export const api = new ApiClient();
