<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Button } from 'carbon-components-svelte'
  import CloseIcon from 'carbon-icons-svelte/lib/Close.svelte'
  import CheckmarkIcon from 'carbon-icons-svelte/lib/Checkmark.svelte'

  import { getErrorsFromResponse } from '../../lib/getErrorsFromResponse'
  import FormError from '../../lib/components/FormError.svelte'
  import {
    playersData,
    error,
    getPlayers,
    isLoading as playersLoading,
  } from '../../lib/stores/players'
  import { gameId } from '../../lib/stores/auth'
  import {
    roundPicks,
    lockRound,
    isLocked,
    getRoundPicks,
  } from '../../lib/stores/round'
  import { isConnected } from '../../lib/stores/websocket'

  let interval
  let loading = false

  async function onLockRound() {
    try {
      loading = true
      await lockRound()
      loading = false
    } catch (err) {
      getErrorsFromResponse(err).join(', ')
    }
  }

  function loadData() {
    getPlayers($gameId)
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
    } else if (!$isLocked) {
      // cleanup just in case
      if (interval) {
        clearInterval(interval)
      }
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

  {#if loading || $playersLoading}
    <p>Loading&hellip;</p>
  {/if}

  <Button
    type="button"
    on:click={lockRound}
    disabled={loading || $playersLoading}>Lock Round</Button
  >
</div>

<style>
  li.player {
    display: flex;
  }
</style>
