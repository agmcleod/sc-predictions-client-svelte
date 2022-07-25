import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { waitFor } from '@testing-library/svelte'

import { auth } from '../../../lib/stores/auth'
import {
  game,
  getInitialState as getGameInitialState,
} from '../../../lib/stores/game'
import {
  round,
  getInitialState as getRoundInitialState,
} from '../../../lib/stores/round'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { createToken } from '../../../test/token'
import { Role } from '../../../lib/types/tokenData'
import CurrentRound from '../CurrentRound.svelte'

const gameId = 'HJG672'
let server: SetupServerApi

beforeAll(() => {
  server = setupServer(
    rest.get(
      `${import.meta.env.VITE_API_URL}/games/${gameId}`,
      (req, res, ctx) => {
        return res(ctx.json(getGameInitialState()))
      }
    ),
    rest.get(
      `${import.meta.env.VITE_API_URL}/current-round`,
      (req, res, ctx) => {
        return res(ctx.json(getRoundInitialState()))
      }
    )
  )

  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  auth.set('')
  game.set(getGameInitialState())
  round.set(getRoundInitialState())
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('<CurrentRound />', () => {
  describe('owner', () => {
    beforeEach(() => {
      auth.set(createToken(gameId, Role.Owner))
    })

    test('hasOpenRound sees current picks', async () => {
      server.use(
        rest.get(
          `${import.meta.env.VITE_API_URL}/games/${gameId}`,
          (req, res, ctx) => {
            return res(
              ctx.json({
                ...getGameInitialState(),
                open_round: true,
                slug: gameId,
              })
            )
          }
        )
      )
      const { queryByText } = renderWithRouter(CurrentRound)

      await waitFor(() =>
        expect(queryByText(/viewcurrentpicks/i)).toBeInTheDocument()
      )
      expect(queryByText(/chooseanswers/i)).not.toBeInTheDocument()
      expect(queryByText(/selectpicks/i)).not.toBeInTheDocument()
      expect(queryByText(/lockscreen/i)).not.toBeInTheDocument()
    })

    test('isLocked but not finished, has to choose answers', async () => {
      server.use(
        rest.get(
          `${import.meta.env.VITE_API_URL}/current-round`,
          (req, res, ctx) => {
            return res(
              ctx.json({
                ...getRoundInitialState(),
                locked: true,
                finished: false,
              })
            )
          }
        )
      )
      const { queryByText } = renderWithRouter(CurrentRound)

      await waitFor(() =>
        expect(queryByText(/chooseanswers/i)).toBeInTheDocument()
      )
      expect(queryByText(/viewcurrentpicks/i)).not.toBeInTheDocument()
      expect(queryByText(/selectpicks/i)).not.toBeInTheDocument()
      expect(queryByText(/lockscreen/i)).not.toBeInTheDocument()
    })
  })
})
