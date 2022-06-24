export enum Role {
  Player = 'Player',
  Owner = 'Owner',
}

export interface TokenData {
  id: number
  user_name: string
  game_id: number
  role: Role
  exp: number
}
