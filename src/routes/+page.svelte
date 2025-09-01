<script lang="ts">
	import {goto} from '$app/navigation';
	import {onMount} from 'svelte';

	onMount(() => {
		if (localStorage.getItem('token')) {
			goto('/home');
		} else {
			goto('/login');
		}
	});
</script>

<div class="flex justify-center items-center min-h-screen">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
		<p class="mt-4 text-gray-600">正在加载...</p>
	</div>
</div>
