<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    Table,
    TableRow,
    TableHead,
    TableHeader,
    TableBody,
    TableCell,
  } from 'carbon-components-svelte'
  import { Link } from 'svelte-navigator'

  import FormError from '../../lib/components/FormError.svelte'
  import { playersData, getPlayers } from '../../lib/stores/players'
  import { role, gameId } from '../../lib/stores/auth'
  import { Role } from '../../lib/types/tokenData'
  import { isConnected } from '../../lib/stores/websocket'
  import { getGameStatus } from '../../lib/stores/game'
  import { getRoundStatus } from '../../lib/stores/round'
  import { getErrorsFromResponse } from '../../lib/getErrorsFromResponse'

  let roundStatusError = ''
  let gameStatusError = ''
  let playersFetchError = ''
  let interval

  async function loadData() {
    try {
      await getGameStatus()
    } catch (err) {
      gameStatusError = getErrorsFromResponse(err).join(', ')
    }

    try {
      await getRoundStatus()
    } catch (err) {
      roundStatusError = getErrorsFromResponse(err).join(', ')
    }
  }

  async function loadPlayerData() {
    try {
      getPlayers($gameId)
    } catch (err) {
      playersFetchError = getErrorsFromResponse(err).join(', ')
    }
  }

  function cleanup() {
    if (interval) {
      clearInterval(interval)
    }
  }

  $: {
    if ($isConnected) {
      if (interval) {
        clearInterval(interval)
      }
    } else {
      if (interval) {
        clearInterval(interval)
      }

      interval = setInterval(() => {
        loadData()
      }, 5000)
    }
  }

  onMount(() => {
    loadData()
    loadPlayerData()
  })
  onDestroy(cleanup)
</script>

<h1>Leaderboard</h1>

<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Player</TableHeader>
      <TableHeader>Score</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {#each $playersData as player}
      <TableRow>
        <TableCell>{player.user_name}</TableCell>
        <TableCell>{player.score}</TableCell>
      </TableRow>
    {/each}
  </TableBody>
</Table>

<FormError errorMsg={gameStatusError} />
<FormError errorMsg={roundStatusError} />
<FormError errorMsg={playersFetchError} />

{#if $role === Role.Owner}
  <Link to="/create-round">Start a new round</Link>
{/if}
