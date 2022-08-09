import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { waitFor, within } from '@testing-library/svelte'

import { auth } from '../../../lib/stores/auth'
import {
  game,
  getInitialState as getGameInitialState,
} from '../../../lib/stores/game'
import {
  players,
  getInitialState as getPlayersInitialState,
} from '../../../lib/stores/players'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { createToken } from '../../../test/token'
import { Role } from '../../../lib/types/tokenData'
import ViewCurrentPicks from '../ViewCurrentPicks.svelte'

let server: SetupServerApi

const gameId = 'HJG672'

beforeAll(() => {
  server = setupServer(
    rest.get(
      `${import.meta.env.VITE_API_URL}/games/HJG672/players`,
      (req, res, ctx) => {
        return res(
          ctx.json([
            {
              id: 1,
              user_name: 'user1',
              game_id: 1,
              score: 2,
            },
            {
              id: 2,
              user_name: 'user2',
              game_id: 1,
              score: 1,
            },
          ])
        )
      }
    ),
    rest.get(
      `${import.meta.env.VITE_API_URL}/rounds/picks`,
      (req, res, ctx) => {
        return res(
          ctx.json({
            locked: false,
            data: [
              {
                question_id: 1,
                id: 1,
                user_id: 1,
                answer: 'foo',
                user_name: 'user1',
              },
            ],
          })
        )
      }
    )
  )

  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  auth.set(createToken(gameId, Role.Owner))
})

afterEach(() => {
  auth.set('')
  game.set(getGameInitialState())
  players.set(getPlayersInitialState())
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('<ViewCurrentPicks />', () => {
  test('renders the players', async () => {
    const { getByText } = renderWithRouter(ViewCurrentPicks)
    await waitFor(() =>
      expect(getByText(/user1/i, { selector: 'li' })).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(
        within(getByText(/user1/i)).getByText(/user picked/i)
      ).toBeInTheDocument()
    )
    const user2 = getByText(/user2/i, { selector: 'li' })
    expect(user2).toBeInTheDocument()
    expect(within(user2).getByText(/user has not picked/i)).toBeInTheDocument()
  })

  test('renders error from api', async () => {
    server.use(
      rest.get(
        `${import.meta.env.VITE_API_URL}/games/HJG672/players`,
        (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              errors: ['Internal server error'],
            })
          )
        }
      )
    )

    const { getByText } = renderWithRouter(ViewCurrentPicks)

    await waitFor(() =>
      expect(getByText(/internal server error/i)).toBeInTheDocument()
    )
  })
})
