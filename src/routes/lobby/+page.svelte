<script>
	import LobbyCard from '$lib/components/lobby/lobby-card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Plus } from 'lucide-svelte';
</script>

<div class="grid h-full w-full flex-1 grid-cols-2 gap-4">
	<div></div>
	<div class="grid flex-1 gap-4">
		<div class="flex-1 gap-4">
			<div class="flex items-center justify-between mb-4">
				<p># active lobbies</p>
				<Button>
					<Plus />
					New Lobby
				</Button>
			</div>
			<Card class="p-4 grid stack gap-4">
        <LobbyCard />
      </Card>
		</div>
	</div>
</div>
