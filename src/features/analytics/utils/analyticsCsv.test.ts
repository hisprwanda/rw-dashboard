import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { analyticsToCsv } from './analyticsCsv'

const header = (name: string, column: string, meta: boolean, hidden = false) => ({
    name,
    column,
    meta,
    hidden,
    valueType: 'TEXT',
    type: 'java.lang.String',
})

const response = {
    headers: [
        header('dx', 'Data', true),
        header('pe', 'Period', true),
        header('hidden', 'Hidden', false, true),
        header('value', 'Value', false),
    ],
    rows: [
        ['a', '202601', 'x', '12.5'],
        ['b', '202602', 'x', '3'],
    ],
    metaData: {
        items: {
            a: { name: 'ANC 1, first visit' },
            '202601': { name: 'January 2026' },
            b: { name: 'Say "hi"' },
        },
        dimensions: {},
    },
    width: 4,
    height: 2,
} as AnalyticsResponse

describe('analyticsToCsv', () => {
    it('writes names instead of ids and skips hidden columns', () => {
        expect(analyticsToCsv(response).split('\r\n')).toEqual([
            'Data,Period,Value',
            '"ANC 1, first visit",January 2026,12.5',
            '"Say ""hi""",202602,3',
        ])
    })
})
