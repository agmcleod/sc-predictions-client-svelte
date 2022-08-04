<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Button } from 'carbon-components-svelte'
  import CloseIcon from 'carbon-icons-svelte/lib/Close.svelte'
  import CheckmarkIcon from 'carbon-icons-svelte/lib/Checkmark.svelte'

  import FormError from '../../lib/components/FormError.svelte'
  import {
    playersData,
    error,
    getPlayers,
    isLoading,
  } from '../../lib/stores/players'
  import { gameId } from '../../lib/stores/auth'
  import { roundPicks, getRoundPicks } from '../../lib/stores/round'
  import { isConnected } from '../../lib/stores/websocket'

  let interval
  function lockRound() {}

  function loadData() {
    getPlayers($gameId)
  }

  function cleanup() {
    if (interval) {
      clearInterval(interval)
    }
  }

  $: {
    if ($isConnected && interval) {
      clearInterval(interval)
    } else {
      interval = setInterval(() => {
        getRoundPicks()
      }, 5000)
    }
  }

  onMount(loadData)
  onDestroy(cleanup)
</script>

<div class="container">
  <h1>Who has picked</h1>

  <ul>
    {#each $playersData as player}
      <li class="player">
        {player.user_name}
        {#if $roundPicks.filter((pick) => pick.user_id === player.id).length > 0}
          <CheckmarkIcon fill="green" />
        {:else}
          <CloseIcon fill="red" />
        {/if}
      </li>
    {/each}
  </ul>

  <FormError errorMsg={$error} />

  <Button type="button" on:click={lockRound}>Lock Round</Button>
</div>

<style>
  li.player {
    display: flex;
  }
</style>
