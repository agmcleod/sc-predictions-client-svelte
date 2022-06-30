<script lang="ts">
  import { useNavigate } from 'svelte-navigator'
  import { Button, TextInput } from 'carbon-components-svelte'

  import * as api from '../lib/api'
  import { getGameStatus } from '../lib/stores/game'
  import FormError from '../lib/components/FormError.svelte'
  import { getErrorsFromResponse } from '../lib/getErrorsFromResponse'

  const navigate = useNavigate()
  let playerOne = ''
  let playerTwo = ''
  let playerOneError = ''
  let playerTwoError = ''
  let serverError = ''

  async function onSubmit() {
    if (!playerOne) {
      playerOneError = 'Enter a value for player one'
    }

    if (!playerTwo) {
      playerTwoError = 'Enter a value for player two'
    }

    if (playerOne && playerTwo && playerOne === playerTwo) {
      playerTwoError = 'Name must be different from player one'
    }

    if (playerOneError || playerTwoError) {
      return
    }

    try {
      await api.postRequest('/rounds', {
        player_one: playerOne,
        player_two: playerTwo,
      })

      await getGameStatus()
      navigate('/round')
    } catch (err) {
      console.log(err.message)
      serverError = getErrorsFromResponse(err.message).join(',')
    }
  }
</script>

<h1>Start new round</h1>
<form on:submit|preventDefault={onSubmit}>
  <FormError errorMsg={serverError} />
  <div class="field-wrapper">
    <TextInput
      labelText="Player One"
      bind:value={playerOne}
      invalid={Boolean(playerOneError)}
      invalidText={playerOneError}
    />
  </div>
  <div class="field-wrapper">
    <TextInput
      labelText="Player Two"
      bind:value={playerTwo}
      invalid={Boolean(playerTwoError)}
      invalidText={playerTwoError}
    />
  </div>
  <Button type="submit">Submit</Button>
</form>

<style>
  .field-wrapper {
    margin-bottom: 20px;
  }
</style>
