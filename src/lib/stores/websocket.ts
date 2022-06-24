import { writable } from 'svelte/store'

interface WebsocketState {
  connected: boolean
}

export const websocket = writable<WebsocketState>({
  connected: false,
})
