<script lang="ts">
  import { Router, Route } from 'svelte-navigator'
  import 'carbon-components-svelte/css/white.css'

  import './index.css'
  import NewGame from './routes/NewGame.svelte'
</script>

<main class="mdc-typography">
  <div class="container">
    <Router>
      <Route path="/" component={NewGame} />
    </Router>
  </div>
</main>

<style>
  .container {
    padding: 0 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
