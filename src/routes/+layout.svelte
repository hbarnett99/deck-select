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

<!-- Add flex flex-col to the outer div to create a column flex container -->
<div class="flex min-h-screen flex-col bg-background px-16 font-sans antialiased">
	{#if session}
		<header>
			<nav class="flex items-center justify-between py-4">
				<a href="/" class="text-lg font-bold">Deck Select</a>
				<span class="space-x-4">
					<Button onclick={logSession}>Log Session</Button>
					{#if session}
						<a href="/profile" class="text-blue-500">Profile</a>
						<a href="/auth/signout" class="text-blue-500">Sign Out</a>
					{:else}
						<a href="/auth" class="text-blue-500">Login</a>
					{/if}
				</span>
			</nav>
		</header>
	{/if}
	<!-- Add flex-1 to make main fill remaining space -->
	<main class="flex flex-1 flex-col items-center justify-center pb-8 pt-2">
		{@render children()}
	</main>
</div>
