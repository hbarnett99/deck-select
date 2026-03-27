<!-- src/routes/pools/+page.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Plus } from 'lucide-svelte';
	import NewPool from './new-pool.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let newPoolOpen = $state(false);
</script>

<div class="w-full max-w-2xl">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Pools</h1>
		<Button onclick={() => (newPoolOpen = true)}>
			<Plus class="mr-2 h-4 w-4" />
			New Pool
		</Button>
	</div>

	{#if data.pools.length === 0}
		<p class="text-muted-foreground text-center py-12">
			No pools yet — create one to get started.
		</p>
	{:else}
		<div class="space-y-2">
			{#each data.pools as pool (pool.id)}
				<a href="/pools/{pool.id}" class="block">
					<Card.Root class="hover:bg-muted/50 transition-colors cursor-pointer">
						<Card.Content class="flex items-center justify-between p-4">
							<span class="font-medium">{pool.name}</span>
							<span class="text-muted-foreground text-sm">
								{pool.pool_commanders?.length ?? 0} commanders
							</span>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</div>

<NewPool data={data.form} bind:open={newPoolOpen} />
