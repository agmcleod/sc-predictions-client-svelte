import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { waitFor, fireEvent } from '@testing-library/svelte'

import { renderWithRouter } from '../../test/renderWithRouter'
import NewGame from '../NewGame.svelte'

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
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

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
})
