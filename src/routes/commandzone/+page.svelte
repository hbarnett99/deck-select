<script lang="ts">
	import type { ScryfallCard, ScryfallList } from '@scryfall/api-types';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import ScryfallService from '$lib/utils/scryfall.util';
	import { Card } from '$lib/components/ui/card';
	import Label from '$lib/components/ui/label/label.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

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

	// const search = async (search: string) => Cards.byName(search, true).then((results) => searchResults = results);
	const searchCommanders = async (search: string) =>
		await ScryfallService.searchCommanders(search)
			.then((results) => (searchResults = results.data))
			.finally(() => (searching = false));

	$effect(() => {
		handleSearch(form.search);
	});
</script>

<h1>Command Zone</h1>
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
					<div class="flex flex-col space-x-2 items-left">
						<!-- <img src={card.image_status} alt={card.name} /> -->
						<div class="flex flex-col">
							<span>{card.name}</span>
							<span class="text-gray-500 italic">{card.set_name}</span>
						</div>
					</div>
					<p class="text-gray-500">${card.prices.usd}</p>
				</Button>
			{/each}
		{:else if form.search.length > 2}
			<p>No results found</p>
		{:else}
			<p>Search for a card</p>
		{/if}
	</div>
</Card>
