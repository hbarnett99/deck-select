<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="w-full max-w-4xl">
	<h1 class="mb-4 text-2xl font-semibold">Command Zone</h1>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Commander</Table.Head>
				<Table.Head class="text-right">Claimed</Table.Head>
				<Table.Head class="text-right">W / L / D</Table.Head>
				<Table.Head class="text-right">Avg Value</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.stats as s (s.commander_id)}
				<Table.Row>
					<Table.Cell class="font-medium">{s.commander_name}</Table.Cell>
					<Table.Cell class="text-right">{s.times_claimed ?? 0}</Table.Cell>
					<Table.Cell class="text-right">
						{s.wins ?? 0} / {s.losses ?? 0} / {s.draws ?? 0}
					</Table.Cell>
					<Table.Cell class="text-right">
						{s.avg_deck_value_usd != null ? `$${s.avg_deck_value_usd}` : '—'}
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={4} class="text-muted-foreground py-8 text-center">
						No commanders yet — add some to a pool to get started.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
