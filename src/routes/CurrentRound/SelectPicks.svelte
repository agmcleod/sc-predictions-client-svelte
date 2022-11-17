<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Button, Select, SelectItem } from 'carbon-components-svelte'

  import FormError from '../../lib/components/FormError.svelte'
  import type { Answers } from '../../lib/types/answers'
  import {
    questions,
    arePicksChosen,
    playerNames,
    getRoundStatus,
    savePicks,
    error,
  } from '../../lib/stores/round'
  import { isConnected } from '../../lib/stores/websocket'
  import { getErrorsFromResponse } from '../../lib/getErrorsFromResponse'

  let interval
  let answerValidationErrors = {}

  async function loadData() {
    getRoundStatus()
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

  async function onSubmit() {
    answerValidationErrors = {}
    for (const answer of answers) {
      if (!answer.value) {
        answerValidationErrors[answer.id] = 'Please make a selection'
      }
    }
    if (Object.keys(answerValidationErrors).length === 0) {
      savePicks(answers)
    }
  }

  onMount(loadData)
  onDestroy(cleanup)

  let answers: Answers = []
  $: {
    if (answers.length === 0) {
      answers = $questions.map((q) => ({
        id: q.id,
        label: q.body,
        value: '',
      }))
    }
  }
</script>

{#if $arePicksChosen}
  <h1>Picks selected</h1>
  <p>Waiting for round to be locked.</p>
{:else}
  <h1>Select your picks</h1>
  {#if $questions.length === 0 || $playerNames.length === 0}
    <p>Loading data</p>
  {:else}
    <form on:submit|preventDefault={onSubmit}>
      {#each answers as answer}
        <div class="answer">
          <Select bind:selected={answer.value} labelText={answer.label}>
            <SelectItem value={''} text={'Choose an option'} />
            {#each $playerNames as playerName}
              <SelectItem value={playerName} text={playerName} />
            {/each}
          </Select>
          <FormError errorMsg={answerValidationErrors[answer.id]} />
        </div>
      {/each}

      <Button type="submit">Save picks</Button>
    </form>
  {/if}
{/if}

<FormError errorMsg={$error} />

<style>
  .answer {
    margin-bottom: 20px;
  }
</style>
