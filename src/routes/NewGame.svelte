<script lang="ts">
  import { onMount } from 'svelte'
  import Button from '@smui/button'
  import Select, { Option } from '@smui/select'
  import LayoutGrid, { Cell } from '@smui/layout-grid'
  import { useNavigate } from 'svelte-navigator'

  import { auth } from '../lib/auth'
  import FormError from '../lib/components/FormError.svelte'
  import * as api from '../lib/api'
  import Typography from '../lib/components/Typography.svelte'
  import type { Question } from '../lib/types/question'

  interface GameQuestion {
    id?: number
  }

  interface GameResponse {
    creator: string
  }

  let loading = true
  let questions = []
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

      auth.set(response.creator)
      // TODO: Clear out other previous game state data if any
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
  <Typography variant="h1">New Game</Typography>
  <form on:submit|preventDefault={submit}>
    <div class="questions">
      {#if loading}
        <p>Loading&hellip;</p>
      {:else}
        {#each gameQuestions as gameQuestion}
          <div class="question-row">
            <Select bind:value={gameQuestion.id} label="Select Question">
              {#each questions as question}
                <Option value={question.id}>{question.body}</Option>
              {/each}
            </Select>
          </div>
        {/each}
      {/if}
      <FormError errorMsg={error} />
    </div>
    <LayoutGrid>
      <Cell>
        <Button variant="raised" type="button" on:click={addGameQuestion}>
          Add Question
        </Button>
      </Cell>
      <Cell>
        <Button variant="raised" type="submit">Create</Button>
      </Cell>
    </LayoutGrid>
  </form>
</div>

<style>
  .questions {
    padding-bottom: 20px;
  }

  .question-row {
    margin-bottom: 20px;
  }
</style>
