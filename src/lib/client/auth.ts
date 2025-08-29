import { goto } from '$app/navigation';

export async function authFetch(url: string, options: RequestInit = {}) {
	const response = await fetch(url, options);
	
	if (response.status === 401) {
		goto('/login');
		return response;
	}
	
	return response;
}
