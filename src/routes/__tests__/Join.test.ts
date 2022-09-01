import { vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/svelte'
import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { useNavigate } from 'svelte-navigator'

import { createToken } from '../../test/token'
import { auth } from '../../lib/stores/auth'
import { renderWithRouter } from '../../test/renderWithRouter'
import { Role } from '../../lib/types/tokenData'
import Join from '../Join.svelte'

vi.mock('svelte-navigator', async () => {
  const svn = await vi.importActual<any>('svelte-navigator')
  const navigate = vi.fn()
  return {
    ...svn,
    useNavigate: vi.fn().mockReturnValue(navigate),
  }
})

let token
let server: SetupServerApi
beforeAll(() => {
  token = createToken('XYZ345', Role.Player)

  server = setupServer(
    rest.post(`${import.meta.env.VITE_API_URL}/games/join`, (req, res, ctx) => {
      return res(
        ctx.json({
          session_id: token,
        })
      )
    })
  )
  server.listen({ onUnhandledRequest: 'error' })
})
afterAll(() => {
  server.close()
  auth.set('')
})
afterEach(() => server.resetHandlers())

describe('<Join />', () => {
  test('valid code & name allows user to join', async () => {
    let resultingToken = ''
    auth.subscribe((t) => {
      resultingToken = t
    })
    const { findByText, findByLabelText, queryByText } = renderWithRouter(Join)
    const usernameField = await findByLabelText(/username/i)
    const gamecodeField = await findByLabelText(/game code/i)

    await fireEvent.input(usernameField, { target: { value: 'agmcleod' } })
    await fireEvent.input(gamecodeField, { target: { value: 'XBVF23' } })

    const submitButton = await findByText(/submit/i)
    await fireEvent.click(submitButton)

    await waitFor(() => expect(queryByText(/invalid/i)).not.toBeInTheDocument())

    await waitFor(() => expect(resultingToken).toEqual(token))
  })

  test('missing values shows error', async () => {
    const { findByText, queryByText } = renderWithRouter(Join)

    const submitButton = await findByText(/submit/i)
    await fireEvent.click(submitButton)

    await waitFor(() =>
      expect(queryByText(/invalid username/i)).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(queryByText(/invalid game code/i)).toBeInTheDocument()
    )
  })

  test('shows error returned from API', async () => {
    const { findByText, findByLabelText, getByText } = renderWithRouter(Join)
    const navigate = useNavigate()

    server.use(
      rest.post(
        `${import.meta.env.VITE_API_URL}/games/join`,
        (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              errors: ['Username already in use'],
            })
          )
        }
      )
    )

    const usernameField = await findByLabelText(/username/i)
    const gamecodeField = await findByLabelText(/game code/i)

    await fireEvent.input(usernameField, { target: { value: 'agmcleod' } })
    await fireEvent.input(gamecodeField, { target: { value: 'XBVF23' } })

    const submitButton = await findByText(/submit/i)
    await fireEvent.click(submitButton)

    await waitFor(() =>
      expect(getByText(/Username already in use/i)).toBeInTheDocument()
    )

    expect(navigate).toHaveBeenCalledWith('/lobby')
  })
})
