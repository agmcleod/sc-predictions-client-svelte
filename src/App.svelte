<script lang="ts">
  import { Router, Route } from 'svelte-navigator'
  import 'carbon-components-svelte/css/white.css'

  import PrivateRoute from './lib/PrivateRoute.svelte'
  import './index.css'
  import Lobby from './routes/Lobby.svelte'
  import NewGame from './routes/NewGame.svelte'
</script>

<main class="mdc-typography">
  <div class="container">
    <Router>
      <Route path="/" component={NewGame} />
      <PrivateRoute path="/lobby" component={Lobby} />
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
