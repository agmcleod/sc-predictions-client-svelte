<script lang="ts">
  import { onMount } from 'svelte'
  import { Link } from 'svelte-navigator'

  import FormError from '../lib/components/FormError.svelte'
  import { Role } from '../lib/types/tokenData'
  import { gameId, role } from '../lib/stores/auth'
  import { getPlayers, players } from '../lib/stores/players'

  const JOIN_URL = `${import.meta.env.VITE_HOST}/join`

  function loadPlayers() {
    getPlayers($gameId)
  }

  onMount(loadPlayers)
</script>

<div>
  <h1>Game code: ABCTEMP</h1>
  {#if $role === Role.Owner}
    <p>
      Tell your players the game code, and to join at: {JOIN_URL}
    </p>
  {/if}
  <ul>
    {#each $players.data as player}
      <li>{player.user_name}</li>
    {/each}
  </ul>
  <FormError errorMsg={$players.error} />
  {#if $role === Role.Owner}
    <Link to="/create-round">Start a Round</Link>
  {/if}
</div>
