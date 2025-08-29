import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export interface User {
	userName: string;
	[key: string]: any;
}

export const user = writable<User | null>(null);
export const isAuthenticated = writable<boolean>(false);

// 检查本地存储的token
export function checkAuth() {
	if (!browser) return;
	
	const token = localStorage.getItem('token');
	if (token) {
		return true;
	}
	return false;
}

// 登录
export function login(token: string, userData: User) {
	if (!browser) return;
	
	localStorage.setItem('token', token);
	user.set(userData);
	isAuthenticated.set(true);
}

// 登出
export function logout() {
	if (!browser) return;
	
	localStorage.removeItem('token');
	user.set(null);
	isAuthenticated.set(false);
	goto('/login');
}

// 获取token
export function getToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('token');
}
