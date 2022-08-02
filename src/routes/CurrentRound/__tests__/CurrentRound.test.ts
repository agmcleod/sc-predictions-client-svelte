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
  ApiResponse as RoundApiResponse,
  getInitialState as getRoundInitialState,
} from '../../../lib/stores/round'
import { renderWithRouter } from '../../../test/renderWithRouter'
import { createToken } from '../../../test/token'
import { Role } from '../../../lib/types/tokenData'
import CurrentRound from '../CurrentRound.svelte'

const gameId = 'HJG672'
let server: SetupServerApi

function getRoundResponse() {
  return {
    round_id: 1,
    player_names: [],
    locked: false,
    finished: false,
    picks_chosen: false,
    questions: [],
  }
}

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
        return res(ctx.json(getRoundResponse()))
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
              ctx.json<RoundApiResponse>({
                ...getRoundResponse(),
                locked: true,
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

  describe('Player', () => {
    beforeEach(() => {
      auth.set(createToken(gameId, Role.Player))
    })

    test('hasOpenRound and is not locked, can select picks', async () => {
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
        expect(queryByText(/selectpicks/i)).toBeInTheDocument()
      )
      expect(queryByText(/chooseanswers/i)).not.toBeInTheDocument()
      expect(queryByText(/viewcurrentpicks/i)).not.toBeInTheDocument()
      expect(queryByText(/lockscreen/i)).not.toBeInTheDocument()
    })

    test('isLocked but not finished, sees the locked screen', async () => {
      server.use(
        rest.get(
          `${import.meta.env.VITE_API_URL}/current-round`,
          (req, res, ctx) => {
            return res(
              ctx.json<RoundApiResponse>({
                ...getRoundResponse(),
                locked: true,
              })
            )
          }
        )
      )
      const { queryByText } = renderWithRouter(CurrentRound)

      await waitFor(() =>
        expect(queryByText(/lockscreen/i)).toBeInTheDocument()
      )
      expect(queryByText(/viewcurrentpicks/i)).not.toBeInTheDocument()
      expect(queryByText(/selectpicks/i)).not.toBeInTheDocument()
      expect(queryByText(/chooseanswers/i)).not.toBeInTheDocument()
    })
  })
})
