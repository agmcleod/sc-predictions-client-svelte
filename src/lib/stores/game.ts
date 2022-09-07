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
  loading: boolean
}

export const getInitialState = (): GameState => ({
  slug: '',
  open_round: false,
  unfinished_round: false,
  error: '',
  loading: false,
})

export const game = writable<GameState>(getInitialState())

export const gameSlug = derived(game, (game) => game.slug)
export const hasOpenRound = derived(game, (game) => game.open_round)
export const error = derived(game, (game) => game.error)
export const isLoading = derived(game, (game) => game.loading)

export const getGameStatus = async () => {
  game.update((obj) => ({ ...obj, loading: true }))
  try {
    const res = await api.getRequest<SetGameStatusPayload>(
      `/games/${currentGameId}`
    )

    game.update((state) => ({ ...state, loading: false, error: '', ...res }))
  } catch (err) {
    game.update((state) => ({
      ...state,
      loading: false,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}
