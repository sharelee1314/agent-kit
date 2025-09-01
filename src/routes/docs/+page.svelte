<script>
	import { onMount } from 'svelte';

	onMount(async () => {
		const SwaggerUIBundle = (await import('swagger-ui-dist/swagger-ui-bundle.js')).default;
		SwaggerUIBundle({
			dom_id: '#swagger-ui',
			url: '/api/docs'
		});
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</svelte:head>

<div id="swagger-ui"></div>
