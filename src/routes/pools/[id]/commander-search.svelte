<!-- src/routes/pools/[id]/commander-search.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import ScryfallService from '$lib/utils/scryfall.util';
	import type { ScryfallCard } from '@scryfall/api-types';
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { AddCommanderSchema } from '$lib/schemas/pool';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	let {
		data,
		open = $bindable(false)
	}: { data: SuperValidated<Infer<typeof AddCommanderSchema>>; open?: boolean } = $props();

	let search = $state('');
	let searchResults = $state<ScryfallCard.Normal[] | undefined>();
	let timeout: ReturnType<typeof setTimeout>;
	let searching = $state(false);
	let selectedCommander = $state<string | undefined>(undefined);

	function closeDialog() {
		search = '';
		searchResults = undefined;
		selectedCommander = undefined;
		open = false;
	}

	const { enhance, submitting } = untrack(() => superForm(data, {
		validators: zod4Client(AddCommanderSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				closeDialog();
			}
			if (result.type === 'failure' && result.data?.message) {
				toast.error(result.data.message as string);
			}
		}
	}));

	function handleSearch(value: string) {
		if (value.length < 3) {
			if (value.length === 0) searchResults = undefined;
			return;
		}
		searching = true;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			ScryfallService.searchCommanders(value)
				.then((results) => (searchResults = results.data as ScryfallCard.Normal[]))
				.catch(() => { searchResults = []; })
				.finally(() => (searching = false));
		}, 300);
	}

	$effect(() => {
		handleSearch(search);
		return () => clearTimeout(timeout);
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[800px]">
		<Dialog.Header>
			<Dialog.Title>Commander Search</Dialog.Title>
			<Dialog.Description>Search for a commander to add to this pool.</Dialog.Description>
		</Dialog.Header>
		<form action="?/add" method="POST" use:enhance>
			<input type="hidden" name="commanderName" value={selectedCommander ?? ''} />
			<div class="grid grid-cols-1 gap-2">
				<Input type="text" placeholder="Search for a commander" bind:value={search} />
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
						<ToggleGroup.Root
							type="single"
							class="my-2 grid grid-cols-1 gap-2"
							value={selectedCommander}
							onValueChange={(v) => (selectedCommander = v ?? undefined)}
						>
							{#each searchResults as card}
								<ToggleGroup.Item
									class="flex h-16 w-full flex-grow items-center justify-between p-2"
									value={card.name}
								>
									<div class="flex items-center space-x-3">
										<div class="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
											<img
												class="h-full w-full object-cover"
												src={card.image_uris?.art_crop}
												alt="{card.name} art"
											/>
										</div>
										<div class="flex flex-col text-left">
											<span class="text-sm font-medium">{card.name}</span>
											<span class="text-muted-foreground text-xs italic">{card.set_name}</span>
										</div>
									</div>
									<p class="text-muted-foreground">
										{card.prices?.usd ? `$${card.prices.usd}` : '—'}
									</p>
								</ToggleGroup.Item>
							{/each}
						</ToggleGroup.Root>
					{:else if search.length > 2}
						<div class="flex h-full items-center justify-center">
							<p class="text-muted-foreground">No results found.</p>
						</div>
					{:else}
						<div class="flex h-full items-center justify-center">
							<p class="text-muted-foreground">Search for a card.</p>
						</div>
					{/if}
				</ScrollArea>
			</div>
			<Dialog.Footer class="mt-2">
				<Button variant="outline" type="button" onclick={closeDialog}>Cancel</Button>
				<Button type="submit" class="w-[137px]" disabled={!selectedCommander || $submitting}>
					{#if $submitting}
						<LoaderCircle class="animate-spin" />
					{:else}
						Add Commander
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
