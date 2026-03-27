<!-- src/routes/pools/new-pool.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm, type SuperValidated, type Infer, type SuperForm } from 'sveltekit-superforms';
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
	import { CreatePoolSchema } from '$lib/schemas/pool';

	let { data }: { data: SuperValidated<Infer<typeof CreatePoolSchema>> } = $props();

	export const poolDialogState = $state({ open: false });
	export const poolDialogActions = {
		open: () => (poolDialogState.open = true)
	};

	const sf = superForm(data, {
		validators: zodClient(CreatePoolSchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') poolDialogState.open = false;
		}
	});

	const { form, enhance, submitting } = sf;
	// formsnap requires SuperForm<Record<string, unknown>> — cast through unknown
	const fForm = sf as unknown as SuperForm<Record<string, unknown>>;
</script>

<Dialog.Root bind:open={poolDialogState.open}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>New Pool</Dialog.Title>
			<Dialog.Description>Create a named collection of commanders.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance class="space-y-4">
			<Form.Field form={fForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$form.name} placeholder="e.g. Budget Legends" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Button
					variant="outline"
					type="button"
					onclick={() => (poolDialogState.open = false)}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Creating…' : 'Create Pool'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
