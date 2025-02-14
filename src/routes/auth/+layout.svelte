<script>
	let { children } = $props();
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-background px-16 font-sans antialiased"
>
	{@render children()}
</div>
