import { writable, derived, Readable } from 'svelte/store'
import decode from 'jwt-decode'

import type { Role, TokenData } from '../types/tokenData'

const LS_KEY = 'accessToken'

export const auth = writable(localStorage.getItem(LS_KEY) || '')

export const tokenData = derived<Readable<string>, TokenData | undefined>(
  auth,
  (token: string) => {
    try {
      return decode(token)
    } catch (err) {}
  }
)

export const role = derived<Readable<TokenData | undefined>, Role | null>(
  tokenData,
  (data) => {
    return data ? data.role : null
  }
)

export const gameId = derived<Readable<TokenData | undefined>, number>(
  tokenData,
  (data) => {
    return data ? data.game_id : 0
  }
)

auth.subscribe((token: string) => {
  localStorage.setItem(LS_KEY, token)
})
