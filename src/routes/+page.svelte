<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { data } = $props();
</script>

<Card class="grid h-full w-full flex-1 grid-cols-4 gap-4 p-4">
	<Button href="/lobby" class="h-full" variant="outline">
		<div class="flex w-4/5 flex-col items-center justify-center">
			<h1 class="text-3xl font-extrabold tracking-tight">Lobbies</h1>
			<Separator class="my-4" />
			<p class="text-md flex text-wrap opacity-80">Join a lobby to play games with others.</p>
		</div>
	</Button>
	<Button href="/commandzone" class="h-full" variant="outline">
		<div class="flex w-4/5 flex-col items-center justify-center">
			<h1 class="text-3xl font-extrabold tracking-tight">Command Zone</h1>
			<Separator class="my-4" />
			<p class="text-md flex text-wrap opacity-80">Add and manage available commanders.</p>
		</div>
	</Button>
	<Button href="/statistics" class="h-full" variant="outline">
		<div class="flex w-4/5 flex-col items-center justify-center">
			<h1 class="text-3xl font-extrabold tracking-tight">Statistics</h1>
			<Separator class="my-4" />
			<p class="text-md flex text-wrap opacity-80">View statistics of commanders played.</p>
		</div>
	</Button>
	<Button href="/admin" class="h-full" variant="outline">
		<div class="flex w-4/5 flex-col items-center justify-center">
			<h1 class="text-3xl font-extrabold tracking-tight">Admin</h1>
			<Separator class="my-4" />
			<p class="text-md flex text-wrap opacity-80">Handle the boring things.</p>
		</div>
	</Button>
</Card>
