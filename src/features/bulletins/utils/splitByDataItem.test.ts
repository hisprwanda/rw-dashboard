import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { splitByDataItem } from './splitByDataItem'

it('splits a response into one response per data item', () => {
    const response = {
        headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'value' }],
        rows: [
            ['a', '2024W1', '1'],
            ['b', '2024W1', '2'],
        ],
        metaData: { items: {}, dimensions: { dx: ['a', 'b'], pe: ['2024W1'] } },
    } as unknown as AnalyticsResponse
    const [first, second] = splitByDataItem(response, ['a', 'b'])
    expect(first?.response.rows).toEqual([['a', '2024W1', '1']])
    expect(first?.response.metaData.dimensions).toEqual({ dx: ['a'], pe: ['2024W1'] })
    expect(second?.response.rows).toEqual([['b', '2024W1', '2']])
    expect(splitByDataItem(undefined, ['a'])).toEqual([])
})
