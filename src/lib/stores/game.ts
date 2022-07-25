import { writable, derived } from 'svelte/store'

import * as api from '../api'
import { getErrorsFromResponse } from '../getErrorsFromResponse'
import { gameId } from './auth'

let currentGameId

gameId.subscribe((id) => {
  currentGameId = id
})

interface SetGameStatusPayload {
  slug: string
  open_round: boolean
  unfinished_round: boolean
}

interface GameState extends SetGameStatusPayload {
  error: string
}

export const getInitialState = (): GameState => ({
  slug: '',
  open_round: false,
  unfinished_round: false,
  error: '',
})

export const game = writable<GameState>(getInitialState())

export const gameSlug = derived(game, (game) => game.slug)
export const hasOpenRound = derived(game, (game) => game.open_round)

export const getGameStatus = async () => {
  try {
    const res = await api.getRequest<SetGameStatusPayload>(
      `/games/${currentGameId}`
    )

    game.update((state) => ({ ...state, ...res }))
  } catch (err: any) {
    game.update((state) => ({
      ...state,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}
