import { waitFor } from '@testing-library/svelte'
import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { faker } from '@faker-js/faker'

import { renderWithRouter } from '../../test/renderWithRouter'
import { createToken } from '../../test/token'
import { auth } from '../../lib/stores/auth'
import { Role } from '../../lib/types/tokenData'

import Lobby from '../Lobby.svelte'

const gameId = 'ABC187'

let nameOne
let nameTwo
let server: SetupServerApi

beforeAll(() => {
  nameOne = faker.name.firstName()
  nameTwo = faker.name.firstName()
  server = setupServer(
    rest.get(
      `${import.meta.env.VITE_API_URL}/games/${gameId}/players`,
      (req, res, ctx) => {
        return res(
          ctx.json([
            {
              user_name: nameOne,
            },
            {
              user_name: nameTwo,
            },
          ])
        )
      }
    ),
    rest.get(
      `${import.meta.env.VITE_API_URL}/games/${gameId}`,
      (req, res, ctx) => {
        return res(
          ctx.json({
            slug: gameId,
            open_round: true,
            unfinished_round: true,
          })
        )
      }
    )
  )

  server.listen({ onUnhandledRequest: 'error' })
  auth.set(createToken(gameId, Role.Owner))
})

afterAll(() => {
  server.close()
  auth.set('')
})
afterEach(() => server.resetHandlers())

describe('<Lobby />', () => {
  test('shows game ID & player list', async () => {
    const { queryByText } = renderWithRouter(Lobby)
    await waitFor(() =>
      expect(
        queryByText(new RegExp(`Game code: ${gameId}`))
      ).toBeInTheDocument()
    )

    await waitFor(() => expect(queryByText(nameOne)).toBeInTheDocument())
    await waitFor(() => expect(queryByText(nameTwo)).toBeInTheDocument())
  })
})
