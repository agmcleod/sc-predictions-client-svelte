<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, Select, SelectItem } from 'carbon-components-svelte'
  import { useNavigate } from 'svelte-navigator'

  import { auth } from '../lib/stores/auth'
  import FormError from '../lib/components/FormError.svelte'
  import * as api from '../lib/api'
  import type { Question } from '../lib/types/question'
  import { clear } from '../lib/stores/clear'

  interface GameQuestion {
    id?: number
  }

  interface GameResponse {
    creator: string
  }

  let loading = true
  let questions: Question[] = []
  let gameQuestions: GameQuestion[] = [
    {
      id: undefined,
    },
  ]
  let error = ''
  const navigate = useNavigate()

  async function getQuestions() {
    try {
      questions = await api.getRequest<Question[]>('/questions')
    } catch (err) {
      error = err.message
    } finally {
      loading = false
    }
  }

  function addGameQuestion() {
    gameQuestions = gameQuestions.concat({ id: undefined })
  }

  async function createGame() {
    try {
      const response = await api.postRequest<GameResponse>('/games', {
        question_ids: gameQuestions.map((gq) => gq.id),
      })

      // clear()
      auth.set(response.creator)
      navigate('/lobby')
    } catch (err) {
      error = err.message
    }
  }

  async function submit() {
    if (gameQuestions.filter((gq) => !gq.id).length > 0) {
      error = 'Each question entry must have a question selected'
    } else {
      const selectedIds = gameQuestions.reduce<{ [key: string]: boolean }>(
        (obj, gq) => {
          obj[gq.id || 'undefined'] = true
          return obj
        },
        {}
      )
      if (Object.keys(selectedIds).length < gameQuestions.length) {
        error = 'Each question selected must be unique'
      } else {
        error = ''

        createGame()
      }
    }
  }

  onMount(getQuestions)
</script>

<div>
  <h1>New Game</h1>
  {#if loading}
    <p>Loading&hellip;</p>
  {:else}
    <form on:submit|preventDefault={submit}>
      <div class="questions">
        {#each gameQuestions as gameQuestion}
          <div class="question-row">
            <Select bind:selected={gameQuestion.id} labelText="Select Question">
              {#each questions as question}
                <SelectItem value={question.id} text={question.body} />
              {/each}
            </Select>
          </div>
        {/each}

        <FormError errorMsg={error} />
      </div>
      <div class="buttons">
        <div class="button-cell">
          <Button kind="secondary" type="button" on:click={addGameQuestion}>
            Add Question
          </Button>
        </div>
        <div class="button-cell"><Button type="submit">Create</Button></div>
      </div>
    </form>
  {/if}
</div>

<style>
  .questions {
    padding-bottom: 20px;
  }

  .question-row {
    margin-top: 20px;
    max-width: 400px;
  }

  .buttons {
    display: flex;
    flex-direction: row;
  }

  .button-cell {
    margin-right: 5px;
  }
</style>
