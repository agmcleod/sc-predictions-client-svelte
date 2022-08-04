import { writable, derived } from 'svelte/store'

interface WebsocketState {
  connected: boolean
}

export const websocket = writable<WebsocketState>({
  connected: false,
})

export const isConnected = derived(websocket, (ws) => ws.connected)
