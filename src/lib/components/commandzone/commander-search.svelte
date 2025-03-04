<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import ScryfallService from '$lib/utils/scryfall.util';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { ScryfallCard } from '@scryfall/api-types';
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';

	let form = $state({ search: '' });
	let searchResults = $state<ScryfallCard.Normal[]>();
	let timeout: NodeJS.Timeout;
	let searching = $state(false);
	$inspect({ searchResults });

	export const commandSearchDialogState = $state({
		searchDialogOpen: false
	});
	export const commandSearchDialogActions = {
		openSearchDialog: () => {
			commandSearchDialogState.searchDialogOpen = true;
		},
		closeSearchDialog: () => {
			form.search = '';
			searchResults = [];
			commandSearchDialogState.searchDialogOpen = false;
		},
		handleAddCommander: async (commander: any) => {}
	};

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
			.then((results) => (searchResults = results.data as ScryfallCard.Normal[]))
			.finally(() => (searching = false));

	$effect(() => {
		handleSearch(form.search);
	});
</script>

<Dialog.Root bind:open={commandSearchDialogState.searchDialogOpen}>
	<Dialog.Content class="sm:max-w-[800px]">
		<Dialog.Header>
			<Dialog.Title>Create New Lobby</Dialog.Title>
			<Dialog.Description>
				Create a new lobby for players to join. Set a name and choose if it's a practice mode lobby.
			</Dialog.Description>
		</Dialog.Header>
		<form>
			<!-- <Label>Commander Search</Label> -->
			<Card class="grid grid-cols-1 gap-2 p-4">
				<Input type="text" placeholder="Search for a commander" bind:value={form.search} />
				<ScrollArea class="h-72">
					{#if searching}
						<div class="my-2 space-y-2">
							<Skeleton class="h-16" />
							<Skeleton class="h-16" />
							<Skeleton class="h-16" />
							<Skeleton class="h-16" />
							<Skeleton class="h-16" />
						</div>
					{:else if (searchResults ?? []).length > 0}
						<div class="my-2 space-y-2">
							{#each searchResults! as card}
								<Button
									variant="ghost"
									class="flex h-16 w-full flex-grow items-center justify-between p-2"
								>
									<div class="flex items-center space-x-3">
										<!-- Image with fixed dimensions and proper scaling -->
										<div class="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
											<img
												class="h-full w-full object-cover"
												src={card.image_uris?.art_crop}
												alt={`${card.name} - art crop`}
											/>
										</div>
										<!-- Text content -->
										<div class="flex flex-col text-left">
											<span class="text-sm font-medium">{card.name}</span>
											<span class="text-xs italic text-muted-foreground">{card.set_name}</span>
										</div>
									</div>
									<p class="text-muted-foreground">${card.prices.usd}</p>
								</Button>
							{/each}
						</div>
					{:else if form.search.length > 2}
						<div class="flex h-full flex-grow items-center justify-center">
							<p class="flex flex-grow text-muted-foreground">No results found</p>
						</div>
					{:else}
						<div class="flex h-full flex-grow items-center justify-center">
							<p class="justify-center self-center text-muted-foreground">Search for a card</p>
						</div>
					{/if}
				</ScrollArea>
			</Card>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => (commandSearchDialogState.searchDialogOpen = false)}
				>
					Cancel
				</Button>
				<Button type="submit">Add Commander</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
