<script lang="ts">
  import { Button, Select, SelectItem } from 'carbon-components-svelte'
  import type { Answers } from '../../lib/types/answers'

  import FormError from '../../lib/components/FormError.svelte'
  import { round, scoreRound } from '../../lib/stores/round'

  let error = ''
  let answerValidationErrors = {}

  async function onSubmit() {
    answerValidationErrors = {}
    for (const answer of answers) {
      if (!answer.value) {
        answerValidationErrors[answer.id] = 'Please make a selection'
      }
    }

    if (Object.keys(answerValidationErrors).length === 0) {
      try {
        await scoreRound(answers)
      } catch (err) {
        error = err.message
      }
    }
  }

  let answers: Answers = []
  $: {
    if (answers.length === 0) {
      answers = $round.questions.map((q) => ({
        id: q.id,
        label: q.body,
        value: '',
      }))
    }
  }
</script>

{#if $round.playerNames.length > 0 && $round.questions.length > 0}
  <form on:submit|preventDefault={onSubmit}>
    <h1>Select answers for round</h1>
    {#each answers as answer}
      <div class="answer">
        <Select bind:selected={answer.value} labelText={answer.label}>
          {#each $round.playerNames as playerName}
            <SelectItem value={playerName} text={playerName} />
          {/each}
        </Select>
        <FormError errorMsg={answerValidationErrors[answer.id]} />
      </div>
    {/each}

    <Button type="submit">Score round</Button>
  </form>

  <FormError errorMsg={error} />
{/if}

<style>
  .answer {
    margin-bottom: 20px;
  }
</style>
