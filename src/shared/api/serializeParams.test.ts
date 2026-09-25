import { serializeParams } from './serializeParams'

describe('serializeParams (must match the DHIS2 data engine)', () => {
    it('repeats `filter` arrays', () => {
        expect(serializeParams({ filter: ['ou:ImspTQPwCqd', 'pe:LAST_12_MONTHS'] })).toBe(
            'filter=ou%3AImspTQPwCqd&filter=pe%3ALAST_12_MONTHS'
        )
    })

    it('comma-joins every other array', () => {
        expect(serializeParams({ dimension: ['dx:a;b', 'pe:2024'] })).toBe(
            'dimension=dx%3Aa%3Bb%2Cpe%3A2024'
        )
    })

    it('stringifies scalars and skips empty values', () => {
        expect(serializeParams({ paging: false, pageSize: 50, fields: undefined })).toBe(
            'paging=false&pageSize=50'
        )
    })
})
