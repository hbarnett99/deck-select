<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { superForm, type SuperValidated, type Infer, type SuperForm } from 'sveltekit-superforms';
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
	import { CreateLobbySchema } from '$lib/schemas/lobby';
	import { untrack } from 'svelte';

	let {
		data,
		pools,
		open = $bindable(false)
	}: {
		data: SuperValidated<Infer<typeof CreateLobbySchema>>;
		pools: { id: string; name: string }[];
		open?: boolean;
	} = $props();

	const sf = untrack(() =>
		superForm(data, {
			validators: zodClient(CreateLobbySchema),
			onResult: ({ result }) => {
				if (result.type === 'redirect') open = false;
			}
		})
	);

	const { form, enhance, submitting } = sf;
	const fForm = sf as unknown as SuperForm<Record<string, unknown>>;

	let selectedPoolId = $state<string>('');

	$effect(() => {
		$form.pool_id = selectedPoolId;
	});

	const selectedPoolLabel = $derived(
		pools.find((p) => p.id === selectedPoolId)?.name ?? 'Select a pool'
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>New Lobby</Dialog.Title>
			<Dialog.Description>Create a lobby to start a game.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance class="space-y-4">
			<Form.Field form={fForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$form.name} placeholder="e.g. Friday Night" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={fForm} name="pool_id">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Pool</Form.Label>
						<input type="hidden" name="pool_id" value={selectedPoolId} />
						<Select.Root type="single" bind:value={selectedPoolId}>
							<Select.Trigger {...props}>
								{selectedPoolLabel}
							</Select.Trigger>
							<Select.Content>
								{#each pools as pool (pool.id)}
									<Select.Item value={pool.id}>{pool.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex items-center gap-3">
				<Switch bind:checked={$form.practice_mode} name="practice_mode" id="practice_mode" />
				<Label for="practice_mode">Practice mode (no stats recorded)</Label>
			</div>

			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Creating…' : 'Create Lobby'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
