import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { withHeaderIndexes } from './analyticsData'

describe('withHeaderIndexes', () => {
    it('numbers the headers by their position and leaves the rest alone', () => {
        const header = (name: string) => ({
            name,
            column: name,
            valueType: 'TEXT',
            type: 'x',
            hidden: false,
            meta: true,
        })
        const response = {
            headers: [header('dx'), header('pe'), header('value')],
            rows: [['a', '202601', '3']],
            metaData: { items: {}, dimensions: {} },
            width: 3,
            height: 1,
        } satisfies AnalyticsResponse

        const result = withHeaderIndexes(response)
        expect(result.headers.map((h) => (h as { index?: number }).index)).toEqual([0, 1, 2])
        expect(result.rows).toBe(response.rows)
        expect(response.headers[0]).not.toHaveProperty('index')
    })
})
