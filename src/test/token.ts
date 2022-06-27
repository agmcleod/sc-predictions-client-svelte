import jwt from 'jsonwebtoken'
import type { Role } from '../lib/types/tokenData'

export const SIGN_TOKEN =
  '31d8866da3141c7ab4636cd72e3b8db09023e1e72a6f4e7c2b53d1a6aaaaa048'

export const createToken = (gameId: string, role: Role) => {
  return jwt.sign(
    {
      game_id: gameId,
      role,
    },
    SIGN_TOKEN
  )
}
