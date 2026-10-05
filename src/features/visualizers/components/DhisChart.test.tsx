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

    it('colors the values with a fixed legend set', () => {
        const legendSet = {
            id: 'ls1',
            name: 'Coverage',
            legends: [
                { name: 'Low', startValue: 0, endValue: 1000, color: '#ff0000' },
                { name: 'High', startValue: 1000, endValue: 100000, color: '#00ff00' },
            ],
        }
        const { container } = render(
            <DhisChart
                data={response}
                visualization={{
                    ...visualization,
                    legend: { strategy: 'FIXED', style: 'FILL', set: { id: 'ls1' } },
                }}
                legendSets={[legendSet]}
            />
        )
        expect(container.querySelector('.highcharts-container')).not.toBeNull()
        expect(screen.queryByRole('alert')).toBeNull()
    })

    it('shows an error instead of crashing when the layout does not fit the data', () => {
        render(<DhisChart data={response} visualization={{ ...visualization, columns: [] }} />)
        expect(screen.getByRole('alert')).not.toBeNull()
    })
})
