<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { getRoundStatus } from '../../lib/stores/round'
  import { getErrorsFromResponse } from '../../lib/getErrorsFromResponse'
  import { isConnected } from '../../lib/stores/websocket'
  import FormError from '../../lib/components/FormError.svelte'

  let interval
  let error = ''

  async function loadData() {
    try {
      await getRoundStatus()
    } catch (err) {
      error = getErrorsFromResponse(err).join(', ')
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
        getRoundStatus()
      }, 5000)
    }
  }

  onMount(loadData)
  onDestroy(cleanup)
</script>

<h1>Round is locked</h1>
<p>Enjoy the game! You will see the scoring once the answers are all marked.</p>
<FormError errorMsg={error} />
