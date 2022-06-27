<script lang="ts">
  import { Button, TextInput } from 'carbon-components-svelte'
  import { useNavigate } from 'svelte-navigator'

  import FormError from '../lib/components/FormError.svelte'
  import { getErrorsFromResponse } from '../lib/getErrorsFromResponse'
  import * as api from '../lib/api'
  import { auth } from '../lib/stores/auth'
  import { clear } from '../lib/stores/clear'

  const navigate = useNavigate()

  let username = ''
  let gamecode = ''
  let usernameError = ''
  let gamecodeError = ''
  let serverError = ''

  async function onSubmit() {
    if (!username) {
      usernameError = 'Invalid username'
    }
    if (gamecode.length !== 6) {
      gamecodeError = 'Invalid game code'
    }

    if (usernameError) {
      return
    }

    usernameError = ''

    try {
      const response = await api.postRequest<{ session_id: string }>(
        '/games/join',
        {
          name: username,
          slug: gamecode,
        }
      )
      clear()

      const token = response.session_id
      if (token) {
        auth.set(token)
        navigate('/lobby')
      }
    } catch (err) {
      serverError = getErrorsFromResponse(err).join(', ')
    }
  }
</script>

<h1>Join Game</h1>
<FormError errorMsg={serverError} />
<form on:submit|preventDefault={onSubmit}>
  <div class="field-wrapper">
    <TextInput
      labelText="Username"
      bind:value={username}
      invalid={Boolean(usernameError)}
      invalidText={usernameError}
    />
  </div>
  <div class="field-wrapper">
    <TextInput
      labelText="Game Code"
      bind:value={gamecode}
      minlength={6}
      maxlength={6}
      invalid={Boolean(gamecodeError)}
      invalidText={gamecodeError}
    />
  </div>
  <Button type="submit">Submit</Button>
</form>

<style>
  .field-wrapper {
    margin-bottom: 20px;
  }
</style>
