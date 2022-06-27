import { auth } from './auth'
import { game, getInitialState as gameGetInitialState } from './game'
import { players, getInitialState as playersGetInitialState } from './players'

export const clear = () => {
  auth.set('')
  game.set(gameGetInitialState())
  players.set(playersGetInitialState())
}
