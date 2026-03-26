<script>
	let { children } = $props();
</script>

<div
	class="bg-background flex min-h-screen flex-col items-center justify-center px-16 font-sans antialiased"
>
	{@render children()}
</div>
