import { render, screen } from '@testing-library/react'
import type { Visualization } from '../types/visualization.types'
import response from './__fixtures__/analytics-response.json'
import { DhisChart } from './DhisChart'

jest.mock('@/shared/components', () => ({
    ErrorState: ({ error }: { error: Error }) => <div role="alert">{error.message}</div>,
}))

const visualization: Visualization = {
    type: 'COLUMN',
    columns: [{ dimension: 'dx', items: [{ id: 'Uvn6LCg7dVU' }, { id: 'sB79w2hiLp8' }] }],
    rows: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
    filters: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }] }],
}

describe('DhisChart', () => {
    it('draws the response with the DHIS2 chart engine', () => {
        const { container } = render(<DhisChart data={response} visualization={visualization} />)
        expect(container.querySelector('.highcharts-container')).not.toBeNull()
        expect(screen.queryByRole('alert')).toBeNull()
    })

    it('shows an error instead of crashing when the layout does not fit the data', () => {
        render(<DhisChart data={response} visualization={{ ...visualization, columns: [] }} />)
        expect(screen.getByRole('alert')).not.toBeNull()
    })
})
