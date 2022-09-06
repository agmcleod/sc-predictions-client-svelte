import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { waitFor } from '@testing-library/svelte'

import {
  round,
  getInitialState as getInitialRoundState,
} from '../../../lib/stores/round'
import {
  game,
  getInitialState as getInitialGameState,
} from '../../../lib/stores/game'
import Leaderboard from '../Leaderboard.svelte'
import { auth } from '../../../lib/stores/auth'
import { Role } from '../../../lib/types/tokenData'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { createToken } from '../../../test/token'

let server: SetupServerApi
const gameId = 'GHY26U'

beforeAll(() => {
  server = setupServer(
    rest.get(
      `${import.meta.env.VITE_API_URL}/games/${gameId}`,
      (req, res, ctx) =>
        res(
          ctx.json({
            slug: gameId,
            open_round: true,
            unfinished_round: false,
          })
        )
    ),
    rest.get(
      `${import.meta.env.VITE_API_URL}/games/current-round`,
      (req, res, ctx) =>
        res(
          ctx.json({
            locked: true,
            finished: true,
            questions: [],
            playerNames: [],
            picksChosen: true,
          })
        )
    ),
    rest.get(
      `${import.meta.env.VITE_API_URL}/games/${gameId}/players`,
      (req, res, ctx) =>
        res(
          ctx.json([
            {
              id: 1,
              user_name: 'Alpha',
              game_id: gameId,
              score: 50,
            },
            {
              id: 2,
              user_name: 'Beta',
              game_id: gameId,
              score: 80,
            },
          ])
        )
    )
  )

  server.listen({ onUnhandledRequest: 'error' })
  auth.set(createToken(gameId, Role.Owner))
})

afterEach(() => {
  game.set(getInitialGameState())
  round.set(getInitialRoundState())
  server.resetHandlers()
})

afterAll(() => {
  auth.set('')
  server.close()
})

describe('<Leaderboard />', () => {
  test('renders the players & scores', async () => {
    const { getByText } = renderWithRouter(Leaderboard)
    await waitFor(() =>
      expect(
        getByText(/alpha/i, {
          selector: 'tbody > tr:nth-child(1) > td:nth-child(1)',
        })
      ).toBeInTheDocument()
    )
    expect(
      getByText(/50/, {
        selector: 'tbody > tr:nth-child(1) > td:nth-child(2)',
      })
    ).toBeInTheDocument()
    expect(
      getByText(/beta/i, {
        selector: 'tbody > tr:nth-child(2) > td:nth-child(1)',
      })
    ).toBeInTheDocument()
    expect(
      getByText(/80/, {
        selector: 'tbody > tr:nth-child(2) > td:nth-child(2)',
      })
    ).toBeInTheDocument()
  })
})
