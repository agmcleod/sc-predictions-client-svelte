import { writable, derived } from 'svelte/store'

import { getErrorsFromResponse } from '../getErrorsFromResponse'
import type { Player } from '../types/player'
import * as api from '../api'

export const getInitialState = () => ({
  data: [],
  loading: false,
  error: '',
})

export const players = writable<{
  data: Player[]
  loading: boolean
  error: string
}>(getInitialState())

export const isLoading = derived(players, (players) => players.loading)
export const playersData = derived(players, (players) => players.data)
export const error = derived(players, (players) => players.error)

export const getPlayers = async (gameId: number) => {
  players.update((obj) => ({ ...obj, loading: true }))
  try {
    const res = await api.getRequest<Player[]>(`/games/${gameId}/players`)

    players.set({ data: res, loading: false, error: '' })
  } catch (err: any) {
    players.update((obj) => ({
      ...obj,
      loading: false,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}
