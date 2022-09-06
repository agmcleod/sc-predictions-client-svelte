import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { waitFor, fireEvent } from '@testing-library/svelte'

import { round, getInitialState, RoundState } from '../../../lib/stores/round'
import { renderWithRouter } from '../../../test/renderWithRouter'
import SelectPicks from '../SelectPicks.svelte'
import type { Unsubscriber } from 'svelte/store'

let server: SetupServerApi

beforeAll(() => {
  server = setupServer(
    rest.get(`${import.meta.env.VITE_API_URL}/current-round`, (req, res, ctx) =>
      res(
        ctx.json({
          round_id: 1,
          locked: false,
          finished: false,
          player_names: ['abc', 'def'],
          questions: [
            {
              id: 1,
              body: 'Who will win?',
            },
            {
              id: 2,
              body: 'Who will scout first?',
            },
          ],
        })
      )
    )
  )

  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  round.set(getInitialState())
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('<SelectPicks />', () => {
  test('shows loading message', async () => {
    const { queryByText } = renderWithRouter(SelectPicks)
    expect(queryByText(/select your picks/i)).toBeInTheDocument()
    expect(queryByText(/loading data/i)).toBeInTheDocument()
  })

  test('shows an error if data loading fails', async () => {
    server.use(
      rest.get(
        `${import.meta.env.VITE_API_URL}/current-round`,
        (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              errors: ['Request failed'],
            })
          )
        }
      )
    )
    const { getByText } = renderWithRouter(SelectPicks)
    await waitFor(() =>
      expect(getByText(/request failed/i)).toBeInTheDocument()
    )
  })

  test('contains options of the playernames', async () => {
    const { getAllByText } = renderWithRouter(SelectPicks)

    await waitFor(() => expect(getAllByText(/abc/i).length).toEqual(2))
    expect(getAllByText(/def/i).length).toEqual(2)
  })

  test('not making selections show error messages', async () => {
    const { getByText, getAllByText, queryByText } =
      renderWithRouter(SelectPicks)
    await waitFor(() => expect(queryByText(/loading data/i)).toBeNull())
    await waitFor(() => expect(getByText(/who will win/i)).toBeInTheDocument())

    const button = getByText(/save picks/i)
    await fireEvent.click(button)

    const errors = getAllByText(/please make a selection/i)
    expect(errors.length).toEqual(2)
  })

  test('selecting values scores the round', async () => {
    server.use(
      rest.post(
        `${import.meta.env.VITE_API_URL}/rounds/set-picks`,
        (req, res, ctx) => {
          return res(ctx.json({}))
        }
      )
    )

    const { findByLabelText, getAllByText, getByText, queryAllByText } =
      renderWithRouter(SelectPicks)

    const q1 = await findByLabelText(/who will win/i)
    const q2 = await findByLabelText(/who will scout first/i)

    await waitFor(() => expect(getAllByText(/abc/i).length).toEqual(2))
    expect(getAllByText(/def/i).length).toEqual(2)

    await fireEvent.change(q1, { target: { value: 'abc' } })
    await fireEvent.change(q2, { target: { value: 'def' } })

    let roundDetails: RoundState = getInitialState()
    let unsubscribe: Unsubscriber
    unsubscribe = round.subscribe((r) => {
      roundDetails = r
    })

    const button = getByText(/save picks/i)
    await fireEvent.click(button)

    const errors = queryAllByText(/please make a selection/i)
    expect(errors.length).toEqual(0)

    await waitFor(() => expect(roundDetails.picksChosen).toEqual(true))
    await waitFor(() =>
      expect(getByText(/picks selected/i)).toBeInTheDocument()
    )

    unsubscribe()
  })
})
