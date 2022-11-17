<script lang="ts">
  import { Router, Route } from 'svelte-navigator'
  import 'carbon-components-svelte/css/white.css'

  import PrivateRoute from './lib/PrivateRoute.svelte'
  import './index.css'
  import Join from './routes/Join.svelte'
  import Lobby from './routes/Lobby.svelte'
  import NewGame from './routes/NewGame.svelte'
  import NewRound from './routes/NewRound.svelte'
  import Websocket from './lib/Websocket.svelte'
  import CurrentRound from './routes/CurrentRound/CurrentRound.svelte'
</script>

<main class="mdc-typography">
  <div class="container">
    <Websocket />
    <Router>
      <Route path="/" component={NewGame} />
      <PrivateRoute path="/lobby" component={Lobby} />
      <Route path="/join" component={Join} />
      <PrivateRoute path="/create-round" component={NewRound} />
      <PrivateRoute path="/round" component={CurrentRound} />
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
