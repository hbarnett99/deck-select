<script>
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	const logSession = () => console.log(session);
</script>

<div class="min-h-screen bg-background font-sans antialiased px-16">
	{#if session}
		<header>
			<nav class="flex items-center justify-between py-4">
				<Button onclick={logSession}>Log Session</Button>
				<a href="/" class="text-lg font-bold">Henry's Site</a>
				{#if session}
					<a href="/profile" class="text-blue-500">Profile</a>
					<a href="/auth/signout" class="text-blue-500">Sign Out</a>
				{:else}
					<a href="/auth" class="text-blue-500">Login</a>
				{/if}
			</nav>
		</header>
	{/if}
	<main class="flex flex-col items-center justify-center flex-1">
		{@render children()}
	</main>
</div>
