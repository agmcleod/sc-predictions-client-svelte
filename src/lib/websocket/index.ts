interface WebsocketState {
  client: WebSocket | null
}

const state: WebsocketState = {
  client: null,
}

export const createWSConnection = (): WebSocket | null => {
  if (!WebSocket) {
    return null
  }
  return new WebSocket(import.meta.env.VITE_WS_URL || '')
}

export const getClient = (): WebSocket | null => {
  if (state.client === null) {
    state.client = createWSConnection()
  }

  return state.client
}

export const sendMsg = (data: string) => {
  const client = getClient()
  if (!client) {
    return
  }
  if (client.readyState === WebSocket.CONNECTING) {
    const int = setInterval(() => {
      if (client.readyState === WebSocket.OPEN) {
        clearInterval(int)
        client.send(data)
      }
    }, 50)
  } else {
    client.send(data)
  }
}

export const closeConnection = () => {
  if (state.client) {
    state.client.close()
    state.client = null
  }
}
