import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

export const user = writable(null);

export function logout() {
	if (browser) {
		localStorage.removeItem('token');
		user.set(null);
		goto('/login');
	}
}

