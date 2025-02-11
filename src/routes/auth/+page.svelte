<script>
	import Button from '$lib/components/ui/button/button.svelte';

	import Card from '$lib/components/ui/card/card.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
</script>

<form action="?/signInWithDiscord" method="POST">
	<Card class="grid w-[300px] grid-cols-1 gap-4 p-8">
		<!-- <h1 class="text-2xl font-bold w-full">Deck Select</h1>
		<Separator />
		<Input type="email" name="email" placeholder="Email" />
		<Input type="password" name="password" placeholder="Password" />
		<Button>Login</Button>
		<Separator />
		<Button formaction='?signup'>Sign Up</Button> -->
		<h1 class="m-auto text-2xl font-bold">Deck Select</h1>
		<Separator />
		<Button
			type="submit"
			class="bg-discord-500 hover:bg-discord-600 active:bg-discord-700 text-white"
		>
			Sign-in with Discord
		</Button>
	</Card>
	<!-- <label>
		Email
		<input name="email" type="email" />
	</label>
	<label>
		Password
		<input name="password" type="password" />
	</label>
	<button>Login</button>
	<button formaction="?/signup">Sign up</button> -->
</form>
