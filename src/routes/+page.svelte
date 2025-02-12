<script>
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();
</script>

<div>
	<h1>Henry's Site</h1>
	<p>Getting things done. Lmao jk~</p>
	<h2>Instruments</h2>
<!--	<ul>-->
<!--		{#each data.instruments as instrument}-->
<!--			<li>{instrument.name}</li>-->
<!--		{/each}-->
<!--	</ul>-->
  <Button>My Button</Button>
</div>
