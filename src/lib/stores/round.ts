import { writable, derived } from 'svelte/store'

import * as api from '../api'
import type { Question } from '../types/question'
import type { UserAnswer } from '../types/userAnswer'

interface RoundState {
  playerNames: string[]
  locked: boolean
  finished: boolean
  questions: Question[]
  // when a player has chosen their picks
  picksChosen: boolean
  roundPicks: UserAnswer[]
}

export interface ApiResponse {
  player_names: string[]
  questions: Question[]
  round_id: number
  locked: boolean
  finished: boolean
  picks_chosen: boolean
}

export const getInitialState = (): RoundState => ({
  playerNames: [],
  locked: false,
  finished: false,
  questions: [],
  picksChosen: false,
  roundPicks: [],
})

export const round = writable<RoundState>(getInitialState())
export const isLocked = derived(round, (round) => {
  return round.locked
})
export const isFinished = derived(round, (round) => round.finished)

export const getRoundStatus = async () => {
  const res = await api.getRequest<ApiResponse>('/current-round')
  round.update((r) => {
    return {
      ...r,
      locked: res.locked,
      finished: res.finished,
      questions: res.questions,
      playerNames: res.player_names,
      picksChosen: res.picks_chosen,
    }
  })
}
