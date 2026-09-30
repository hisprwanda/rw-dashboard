import { getDimensionItems, transformMetadataLabels } from './metadata'

describe('transformMetadataLabels', () => {
    const result = transformMetadataLabels({
        items: {
            '202401': { name: 'January 2024', uid: '202401' },
            abc: { name: 'ANC 1', uid: 'abc', dimensionItemType: 'INDICATOR' },
        },
        dimensions: { pe: ['202401', '2024Q1'], dx: ['abc'] },
    })

    it('groups items per dimension and classifies periods', () => {
        expect(getDimensionItems(result, 'dataElements').map((i) => i.name)).toEqual(['ANC 1'])
        expect(result.periods.items.map((p) => p.type)).toEqual(['month', 'quarter'])
    })

    it('falls back to the id when an item is missing', () => {
        expect(result.periods.items[1]?.name).toBe('2024Q1')
    })

    it('handles missing metadata', () => {
        expect(getDimensionItems(transformMetadataLabels(undefined), 'orgUnits')).toEqual([])
    })
})
