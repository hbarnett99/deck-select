<script>
	let { children } = $props();
</script>


<div class="min-h-screen flex flex-col items-center justify-center bg-background font-sans antialiased px-16">
	{@render children()}
</div>
