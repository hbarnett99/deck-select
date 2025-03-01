<script lang="ts">
	import CommanderSearch from '$lib/components/commandzone/commander-search.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import ScryfallService from '$lib/utils/scryfall.util';
	import type { ScryfallCard } from '@scryfall/api-types';

	let form = $state({ search: '' });
	let searchResults = $state<ScryfallCard.Any[]>();
	let timeout: NodeJS.Timeout;
	let searching = $state(false);
	$inspect({ searchResults });

	function handleSearch(search: string) {
		if (search.length < 3) {
			if (search.length === 0 && searchResults !== undefined) searchResults = undefined;
			return;
		}
		searching = true;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => searchCommanders(search), 300);
	}

	const searchCommanders = async (search: string) =>
		await ScryfallService.searchCommanders(search)
			.then((results) => (searchResults = results.data))
			.finally(() => (searching = false));

	let isDialogOpen = $state(false);
	const handleOpen = () => {
		isDialogOpen = true;
	};

	let dialog: CommanderSearch;

	$effect(() => {
		handleSearch(form.search);
	});
</script>

<h1>Command Zone</h1>
<Button variant="outline" onclick={handleOpen}>Search Commanders</Button>
<Card class="flex w-full flex-grow flex-col space-y-2 p-4">
	<form class="flex space-x-2">
		<!-- <Label>Commander Search</Label> -->
		<Input type="text" placeholder="Search for a commander" bind:value={form.search} />
	</form>
	<div class="space-y-2">
		{#if searching}
			<Skeleton class="h-16" />
			<Skeleton class="h-16" />
			<Skeleton class="h-16" />
			<Skeleton class="h-16" />
		{:else if (searchResults ?? []).length > 0}
			{#each searchResults! as card}
				<Button variant="ghost" class="flex h-16 w-full flex-grow justify-between">
					<div class="items-left flex flex-col space-x-2">
						<!-- <img src={card.image_status} alt={card.name} /> -->
						<div class="flex flex-col">
							<span>{card.name}</span>
							<span class="italic text-gray-500">{card.set_name}</span>
						</div>
					</div>
					<p class="text-gray-500">${card.prices.usd}</p>
				</Button>
			{/each}
		{:else if form.search.length > 2}
			<p class="text-muted-foreground">No results found</p>
		{:else}
			<p class="self-center text-muted-foreground">Search for a card</p>
		{/if}
	</div>
</Card>

<CommanderSearch bind:this={dialog} />
