<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Link, useNavigate } from 'svelte-navigator'

  import FormError from '../lib/components/FormError.svelte'
  import { Role } from '../lib/types/tokenData'
  import { gameId, role } from '../lib/stores/auth'
  import { game, gameSlug, getGameStatus } from '../lib/stores/game'
  import { getPlayers, players } from '../lib/stores/players'
  import { websocket } from '../lib/stores/websocket'

  const JOIN_URL = `${import.meta.env.VITE_HOST}/join`

  const navigate = useNavigate()

  function loadData() {
    getPlayers($gameId)
    getGameStatus()
  }

  $: if ($game.open_round) {
    navigate('/round')
  }

  let interval: null | NodeJS.Timeout = null
  $: if (!$websocket.connected) {
    interval = setInterval(() => {
      getPlayers($gameId)
      getGameStatus()
    }, 5000)
  } else {
    if (interval) {
      clearInterval(interval)
    }
  }

  onMount(loadData)
  onDestroy(() => {
    if (interval) {
      clearInterval(interval)
    }
  })
</script>

<div>
  <h1>Game code: {$gameSlug}</h1>
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
  <FormError errorMsg={$players.error || $game.error} />
  {#if $role === Role.Owner}
    <Link to="/create-round">Start a Round</Link>
  {/if}
</div>
