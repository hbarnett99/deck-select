<!-- src/routes/lobby/[id]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Crown, LogOut } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Mutable state — patched by Realtime
	let players = $state(data.players);
	let lobby = $state(data.lobby);

	const sortedPlayers = $derived(
		[...players].sort((a, b) => {
			const aAdmin = a.user_id === lobby.admin_id ? 0 : 1;
			const bAdmin = b.user_id === lobby.admin_id ? 0 : 1;
			return aAdmin - bAdmin;
		})
	);

	const allReady = $derived(players.length > 0 && players.every((p) => p.is_ready));

	$effect(() => {
		const supabase = data.supabase;

		// Channel 1 — lobby_players
		const playersChannel = supabase
			.channel(`lobby-players-${data.lobby.id}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'lobby_players',
					filter: `lobby_id=eq.${data.lobby.id}`
				},
				async (payload) => {
					const newRow = payload.new as {
						id: string;
						user_id: string;
						is_ready: boolean;
						commander_id: string | null;
						joined_at: string;
					};
					const res = await fetch(`/api/user/${newRow.user_id}`);
					const meta = res.ok ? await res.json() : { username: 'Unknown', avatar_url: null };
					players = [...players, { ...newRow, ...meta }];
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'lobby_players',
					filter: `lobby_id=eq.${data.lobby.id}`
				},
				(payload) => {
					const updated = payload.new as {
						user_id: string;
						is_ready: boolean;
						commander_id: string | null;
					};
					players = players.map((p) =>
						p.user_id === updated.user_id
							? { ...p, is_ready: updated.is_ready, commander_id: updated.commander_id }
							: p
					);
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'lobby_players',
					filter: `lobby_id=eq.${data.lobby.id}`
				},
				(payload) => {
					const deleted = payload.old as { id: string; user_id: string };
					if (deleted.user_id === data.currentUserId) {
						goto('/lobby');
						return;
					}
					players = players.filter((p) => p.user_id !== deleted.user_id);
				}
			)
			.subscribe();

		// Channel 2 — lobbies
		const lobbyChannel = supabase
			.channel(`lobby-${data.lobby.id}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'lobbies',
					filter: `id=eq.${data.lobby.id}`
				},
				(payload) => {
					const updated = payload.new as { status: string };
					lobby = { ...lobby, status: updated.status };
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(playersChannel);
			supabase.removeChannel(lobbyChannel);
		};
	});
</script>

<div class="w-full max-w-2xl">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">{lobby.name}</h1>
			<p class="text-muted-foreground text-sm">
				{lobby.pools?.name ?? '—'}
				{#if lobby.practice_mode}
					<Badge variant="secondary" class="ml-2">Practice</Badge>
				{/if}
			</p>
		</div>
		<form method="POST" action="?/leave" use:enhance>
			<Button variant="outline" type="submit">
				<LogOut class="mr-2 h-4 w-4" />
				Leave
			</Button>
		</form>
	</div>

	<!-- Player list -->
	<div class="space-y-2">
		{#each sortedPlayers as player (player.user_id)}
			<div class="flex items-center justify-between rounded-lg border p-3">
				<div class="flex items-center gap-3">
					<Avatar.Root class="h-9 w-9">
						<Avatar.Image src={player.avatar_url} alt={player.username} />
						<Avatar.Fallback>{player.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
					</Avatar.Root>
					<span class="font-medium">{player.username}</span>
					{#if player.user_id === lobby.admin_id}
						<Crown class="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
					{/if}
				</div>
				<Badge variant={player.is_ready ? 'default' : 'secondary'}>
					{player.is_ready ? 'Ready' : 'Not Ready'}
				</Badge>
			</div>
		{/each}

		{#if players.length <= 1}
			<p class="text-muted-foreground py-8 text-center text-sm italic">
				Waiting for others to join…
			</p>
		{/if}
	</div>

	<!-- Actions -->
	<div class="mt-6 flex items-center justify-between">
		{#each players.filter((p) => p.user_id === data.currentUserId) as me}
			<form method="POST" action="?/ready" use:enhance>
				<Button type="submit" variant={me.is_ready ? 'outline' : 'default'}>
					{me.is_ready ? 'Unready' : 'Ready Up'}
				</Button>
			</form>
		{/each}

		{#if data.isAdmin}
			<Button disabled={!allReady} variant="default">
				Draw (Step 5)
			</Button>
		{/if}
	</div>
</div>
