import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import { waitFor, fireEvent } from '@testing-library/svelte'
import type { Unsubscriber } from 'svelte/store'

import { round, getInitialState, RoundState } from '../../../lib/stores/round'
import { renderWithRouter } from '../../../test/renderWithRouter'
import ChooseAnswers from '../ChooseAnswers.svelte'

let server: SetupServerApi

beforeAll(() => {
  server = setupServer(
    rest.post(`${import.meta.env.VITE_API_URL}/rounds/score`, (req, res, ctx) =>
      res(ctx.json({}))
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

describe('<ChooseAnswers />', () => {
  test('no form rendered if round data is not there yet', () => {
    const { queryByText } = renderWithRouter(ChooseAnswers)
    expect(queryByText(/select answers for round/i)).not.toBeInTheDocument()
  })

  describe('has data', () => {
    beforeEach(() => {
      round.set({
        ...getInitialState(),
        playerNames: ['Serral', 'Reynor'],
        questions: [
          {
            id: 1,
            body: 'Who will win?',
          },
          {
            id: 2,
            body: 'Who will expand first?',
          },
          {
            id: 3,
            body: 'Who will scout first?',
          },
        ],
      })
    })

    test('contains options of the playernames', async () => {
      const { getAllByText, getByText } = renderWithRouter(ChooseAnswers)

      await waitFor(() =>
        expect(getByText(/select answers for round/i)).toBeInTheDocument()
      )
      await waitFor(() => expect(getAllByText(/Reynor/i).length).toEqual(3))
      await waitFor(() => expect(getAllByText(/Serral/i).length).toEqual(3))
    })

    test('not making selections show error messages', async () => {
      const { getByText, getAllByText } = renderWithRouter(ChooseAnswers)
      await waitFor(() =>
        expect(getByText(/select answers for round/i)).toBeInTheDocument()
      )

      const button = getByText(/score round/i)
      await fireEvent.click(button)

      const errors = getAllByText(/please make a selection/i)
      expect(errors.length).toEqual(3)
    })

    test('selecting values scores the round', async () => {
      const { findByLabelText, getByText, queryAllByText } =
        renderWithRouter(ChooseAnswers)

      const q1 = await findByLabelText(/who will win/i)
      const q2 = await findByLabelText(/who will expand first/i)
      const q3 = await findByLabelText(/who will scout first/i)

      await fireEvent.change(q1, { target: { value: 'Serral' } })
      await fireEvent.change(q2, { target: { value: 'Reynor' } })
      await fireEvent.change(q3, { target: { value: 'Reynor' } })

      let roundDetails: RoundState = getInitialState()
      let unsubscribe: Unsubscriber
      unsubscribe = round.subscribe((r) => {
        roundDetails = r
      })

      const button = getByText(/score round/i)
      await fireEvent.click(button)

      const errors = queryAllByText(/please make a selection/i)
      expect(errors.length).toEqual(0)

      await waitFor(() => expect(roundDetails.finished).toEqual(true))

      unsubscribe()
    })
  })
})
