import { vi } from 'vitest'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { waitFor, fireEvent } from '@testing-library/svelte'
import { useNavigate } from 'svelte-navigator'

import { auth } from '../../lib/stores/auth'
import { createToken } from '../../test/token'
import { renderWithRouter } from '../../test/renderWithRouter'
import NewRound from '../NewRound.svelte'
import { Role } from '../../lib/types/tokenData'

vi.mock('svelte-navigator', async () => {
  const svn = await vi.importActual<any>('svelte-navigator')
  const navigate = vi.fn()
  return {
    ...svn,
    useNavigate: vi.fn().mockReturnValue(navigate),
  }
})

const gameId = 'GHJ293'
const token = createToken(gameId, Role.Owner)

const server = setupServer(
  rest.post(`${import.meta.env.VITE_API_URL}/rounds`, (req, res, ctx) => {
    return res(ctx.json({}))
  }),
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

beforeEach(() => {
  auth.set(token)
})
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  auth.set('')
})

describe('<NewRound />', () => {
  test('submits entered players to backend', async () => {
    const navigate = useNavigate()
    const { findByText, findByLabelText, queryByText } =
      renderWithRouter(NewRound)

    const playerOneInput = await findByLabelText(/player one/i)
    fireEvent.input(playerOneInput, { target: { value: 'One' } })

    const playerTwoInput = await findByLabelText(/player two/i)
    fireEvent.input(playerTwoInput, { target: { value: 'Two' } })

    const submitButton = await findByText(/submit/i)
    await fireEvent.click(submitButton)

    // has no errors
    await waitFor(() =>
      expect(queryByText(/enter a value/i)).not.toBeInTheDocument()
    )
    await waitFor(() =>
      expect(queryByText(/name must be different/i)).not.toBeInTheDocument()
    )

    expect(navigate).toHaveBeenCalledWith('/round')
  })
})
