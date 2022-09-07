import { writable, derived } from 'svelte/store'

import * as api from '../api'
import type { Question } from '../types/question'
import type { UserAnswer } from '../types/userAnswer'
import type { Answers } from '../types/answers'
import { getErrorsFromResponse } from '../getErrorsFromResponse'

import { game } from './game'

export interface RoundState {
  playerNames: string[]
  locked: boolean
  finished: boolean
  questions: Question[]
  // when a player has chosen their picks
  picksChosen: boolean
  roundPicks: UserAnswer[]
  error: string
  loading: boolean
}

export interface RoundStatusResponse {
  player_names: string[]
  questions: Question[]
  round_id: number
  locked: boolean
  finished: boolean
  picks_chosen: boolean
}

export interface RoundPicksResponse {
  data: UserAnswer[]
  locked: boolean
}

export const getInitialState = (): RoundState => ({
  playerNames: [],
  locked: false,
  finished: false,
  questions: [],
  picksChosen: false,
  roundPicks: [],
  error: '',
  loading: false,
})

export const round = writable<RoundState>(getInitialState())
export const isLocked = derived(round, (round) => {
  return round.locked
})
export const isFinished = derived(round, (round) => round.finished)
export const roundPicks = derived(round, (round) => round.roundPicks)
export const playerNames = derived(round, (round) => round.playerNames)
export const arePicksChosen = derived(round, (round) => round.picksChosen)
export const questions = derived(round, (round) => round.questions)
export const error = derived(round, (round) => round.error)
export const isLoading = derived(round, (round) => round.loading)

export const getRoundStatus = async () => {
  try {
    const res = await api.getRequest<RoundStatusResponse>('/current-round')
    round.update((r) => {
      return {
        ...r,
        loading: false,
        error: '',
        locked: res.locked,
        finished: res.finished,
        questions: res.questions,
        playerNames: res.player_names,
        picksChosen: res.picks_chosen,
      }
    })
  } catch (err) {
    round.update((r) => ({
      ...r,
      loading: false,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}

export const getRoundPicks = async () => {
  try {
    const res = await api.getRequest<RoundPicksResponse>('/rounds/picks')
    round.update((r) => ({
      ...r,
      loading: false,
      error: '',
      roundPicks: res.data,
      locked: res.locked,
    }))
  } catch (err) {
    round.update((r) => ({
      ...r,
      loading: false,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}

export const lockRound = async () => {
  try {
    await api.postRequest('/rounds/lock')
    round.update((r) => ({
      ...r,
      locked: true,
      loading: false,
      error: '',
    }))
    game.update((g) => ({
      ...g,
      open_round: false,
    }))
  } catch (err) {
    round.update((r) => ({
      ...r,
      loading: false,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}

export const scoreRound = async (answers: Answers) => {
  try {
    await api.postRequest('/rounds/score', {
      answers: answers.map((a) => ({
        question_id: a.id,
        answer: a.value,
      })),
    })
    round.update((r) => ({
      ...r,
      loading: false,
      error: '',
      finished: true,
    }))
  } catch (err) {
    round.update((r) => ({
      ...r,
      loading: false,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}

export const savePicks = async (answers: Answers) => {
  try {
    await api.postRequest('/rounds/set-picks', {
      answers,
    })
    round.update((r) => ({
      ...r,
      picksChosen: true,
    }))
  } catch (err) {
    round.update((r) => ({
      ...r,
      loading: false,
      error: getErrorsFromResponse(err).join(', '),
    }))
  }
}
