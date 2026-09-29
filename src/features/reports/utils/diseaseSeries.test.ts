import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { diseaseSeries } from './diseaseSeries'

const header = (name: string) => ({
    name,
    column: name,
    valueType: 'TEXT',
    type: 'x',
    hidden: false,
    meta: true,
})

it('extracts one data item per period, sorted, with period names', () => {
    const response = {
        headers: [header('dx'), header('pe'), header('value')],
        rows: [
            ['a', '2024W2', '5'],
            ['b', '2024W1', '9'],
            ['a', '2024W1', '3'],
        ],
        metaData: { items: { '2024W1': { name: 'Week 1' } }, dimensions: {} },
    } as unknown as AnalyticsResponse
    expect(diseaseSeries(response, 'a')).toEqual([
        { period: 'Week 1', value: 3 },
        { period: '2024W2', value: 5 },
    ])
    expect(diseaseSeries(undefined, 'a')).toEqual([])
})
