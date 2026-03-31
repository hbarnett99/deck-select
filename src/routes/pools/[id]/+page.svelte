<!-- src/routes/pools/[id]/+page.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { Trash2, Plus, ArrowLeft } from 'lucide-svelte';
	import CommanderSearch from './commander-search.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchOpen = $state(false);
</script>

<div class="w-full max-w-2xl">
	<div class="mb-4 flex items-center gap-3">
		<Button variant="ghost" size="icon" href="/pools">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<h1 class="text-2xl font-semibold">{data.pool.name}</h1>
		<Button class="ml-auto" onclick={() => (searchOpen = true)}>
			<Plus class="mr-2 h-4 w-4" />
			Add Commander
		</Button>
	</div>

	{#if data.commanders.length === 0}
		<p class="text-muted-foreground py-12 text-center">
			No commanders yet — add one to get started.
		</p>
	{:else}
		<div class="space-y-1">
			{#each data.commanders as entry (entry.commander_id)}
				<div class="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50">
					<span class="font-medium">{entry.commanders?.name ?? '—'}</span>
					<form method="POST" action="?/remove" use:enhance>
						<input type="hidden" name="commanderId" value={entry.commander_id} />
						<Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive">
							<Trash2 class="h-4 w-4" />
						</Button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>

<CommanderSearch bind:open={searchOpen} data={data.form} />
