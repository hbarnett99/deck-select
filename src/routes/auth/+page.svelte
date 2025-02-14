<script>
	import Button from '$lib/components/ui/button/button.svelte';

	import Card from '$lib/components/ui/card/card.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
</script>

<Card class="grid w-[300px] grid-cols-1 gap-4 p-8">
	<h1 class="m-auto text-2xl font-bold">Deck Select</h1>
	<Separator />
	<form action="?/oauthDiscord" method="POST" class="w-full">
		<Button
			type="submit"
			class="w-full bg-discord-500 text-white hover:bg-discord-600 active:bg-discord-700"
		>
			Login with Discord
		</Button>
	</form>
	<form action="?/oauthGoogle" method="POST" class="w-full">
		<Button type="submit" class="w-full">Login with Google</Button>
	</form>
</Card>
