import { writable, derived } from 'svelte/store'

import * as api from '../api'
import type { Question } from '../types/question'
import type { UserAnswer } from '../types/userAnswer'
import type { Answers } from '../types/answers'

import { game } from './game'

export interface RoundState {
  playerNames: string[]
  locked: boolean
  finished: boolean
  questions: Question[]
  // when a player has chosen their picks
  picksChosen: boolean
  roundPicks: UserAnswer[]
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

export const getRoundStatus = async () => {
  const res = await api.getRequest<RoundStatusResponse>('/current-round')
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

export const getRoundPicks = async () => {
  const res = await api.getRequest<RoundPicksResponse>('/rounds/picks')
  round.update((r) => ({
    ...r,
    roundPicks: res.data,
    locked: res.locked,
  }))
}

export const lockRound = async () => {
  await api.postRequest('/rounds/lock')
  round.update((r) => ({
    ...r,
    locked: true,
  }))
  game.update((g) => ({
    ...g,
    open_round: false,
  }))
}

export const scoreRound = async (answers: Answers) => {
  await api.postRequest('/rounds/score', {
    answers: answers.map((a) => ({
      question_id: a.id,
      answer: a.value,
    })),
  })
  round.update((r) => ({
    ...r,
    finished: true,
  }))
}

export const savePicks = async (answers: Answers) => {
  await api.postRequest('/rounds/set-picks', {
    answers,
  })
  round.update((r) => ({
    ...r,
    picksChosen: true,
  }))
}
