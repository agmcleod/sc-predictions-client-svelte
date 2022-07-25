<script lang='ts'>
  import { onMount } from 'svelte';

  import { Role } from '../../lib/types/tokenData'
  import { getGameStatus, hasOpenRound } from '../../lib/stores/game'
  import { getRoundStatus, isFinished, isLocked } from '../../lib/stores/round'
  import { role } from '../../lib/stores/auth'

  function loadData() {
    getGameStatus()
    getRoundStatus()
  }

  onMount(loadData)
</script>

{#if $role === Role.Owner}
  {#if $hasOpenRound}
    ViewCurrentPicks
  {:else if $isLocked && !$isFinished}
    ChooseAnswers
  {/if}
{:else if $role === Role.Player}
  {#if $hasOpenRound && !$isLocked}
    SelectPicks
  {:else if $isLocked && !$isFinished}
    LockScreen
  {/if}
{/if}

{#if $isFinished}
  Leaderboard
{/if}