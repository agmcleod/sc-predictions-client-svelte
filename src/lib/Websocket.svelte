<script lang="ts">
  import { onMount } from 'svelte'

  import { closeConnection, getClient, sendMsg } from './websocket'
  import { websocket } from './stores/websocket'
  import { game } from './stores/game'
  import { players } from './stores/players'

  interface WebsocketMsg {
    game_id: number
    data: any
    path: string
  }

  function handleWebsocketData(message: WebsocketMsg) {
    switch (message.path) {
      case '/players':
        players.update((state) => ({ ...state, data: message.data }))
        break
      case '/game-status':
        game.update((state) => ({ ...state, ...message.data }))
        break
      case '/round-status':
        // dispatch(round.actions.setData(message.data))
        break
      case '/picks':
        // dispatch(round.actions.setRoundPicks(message.data.data))
        // dispatch(round.actions.setLocked(message.data.locked))
        break
    }
  }

  function setupClient() {
    const client = getClient()

    if (client) {
      client.onopen = () => {
        websocket.set({ connected: true })
      }

      client.onmessage = (message: MessageEvent) => {
        try {
          const data = JSON.parse(message.data) as WebsocketMsg
          handleWebsocketData(data)
        } catch (err: any) {
          console.error(err)
        }
      }

      client.onerror = (e) => {
        websocket.set({ connected: false })
        closeConnection()
      }
    }
  }

  onMount(setupClient)
</script>
