import { vi } from 'vitest'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { waitFor, fireEvent } from '@testing-library/svelte'
import { useNavigate } from 'svelte-navigator'

import { auth } from '../../lib/stores/auth'
import { renderWithRouter } from '../../test/renderWithRouter'
import { createToken } from '../../test/token'
import NewGame from '../NewGame.svelte'
import { Role } from '../../lib/types/tokenData'

vi.mock('svelte-navigator', async () => {
  const svn = await vi.importActual<any>('svelte-navigator')
  const navigate = vi.fn()
  return {
    ...svn,
    useNavigate: vi.fn().mockReturnValue(navigate),
  }
})

const token = createToken('JKL123', Role.Owner)

const server = setupServer(
  rest.get(`${import.meta.env.VITE_API_URL}/questions`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          body: 'Question One',
        },
        {
          id: 2,
          body: 'Question Two',
        },
      ])
    )
  }),

  rest.post(`${import.meta.env.VITE_API_URL}/games`, (req, res, ctx) => {
    return res(
      ctx.json({
        creator: token,
      })
    )
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

beforeEach(() => {
  auth.set('')
})

describe('<NewGame />', () => {
  test('shows loading state', () => {
    const { queryByText } = renderWithRouter(NewGame)
    expect(queryByText(/Loading/)).toBeInTheDocument()
  })

  test('renders a single question dropdown after loading questions from the API', async () => {
    const { queryByText } = renderWithRouter(NewGame)
    await waitFor(() => expect(queryByText(/Question One/)).toBeInTheDocument())
    await waitFor(() => expect(queryByText(/Question Two/)).toBeInTheDocument())
    expect(queryByText(/Loading/)).not.toBeInTheDocument()
  })

  test('renders additional dropdown when clicking the Add button', async () => {
    const { queryAllByText, findByText } = renderWithRouter(NewGame)

    const button = await findByText(/add question/i)
    await fireEvent.click(button)

    expect(queryAllByText(/Select Question/i).length).toEqual(2)
  })

  test('submits selected questions to backend', async () => {
    const navigate = useNavigate()
    const { findByText, findAllByLabelText, queryByText } =
      renderWithRouter(NewGame)

    const button = await findByText(/add question/i)
    await fireEvent.click(button)

    const selects = await findAllByLabelText(/Select Question/i)
    expect(selects.length).toEqual(2)
    await fireEvent.change(selects[0], { target: { value: '1' } })
    await fireEvent.change(selects[1], { target: { value: '2' } })

    let resultingToken = ''
    auth.subscribe((token) => {
      resultingToken = token
    })

    const submitButton = await findByText(/Create/i)
    await fireEvent.click(submitButton)

    // has no errors
    await waitFor(() =>
      expect(queryByText(/Each question/i)).not.toBeInTheDocument()
    )

    await waitFor(() => expect(resultingToken).toEqual(token))

    expect(navigate).toHaveBeenCalledWith('/lobby')
  })
})
