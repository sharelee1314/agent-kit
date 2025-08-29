<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/auth';

	onMount(() => {
		const unsubscribe = isAuthenticated.subscribe((authenticated) => {
			if (authenticated) {
				goto('/home');
			} else {
				goto('/login');
			}
		});

		return unsubscribe;
	});
</script>

<div class="flex justify-center items-center min-h-screen">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
		<p class="mt-4 text-gray-600">正在加载...</p>
	</div>
</div>
