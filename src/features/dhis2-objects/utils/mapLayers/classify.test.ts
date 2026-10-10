import {
    CLASSIFICATION_EQUAL_COUNTS,
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_LOGARITHMIC,
    CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
    CLASSIFICATION_STANDARD_DEVIATION,
    getAutomaticLegendItems,
    getLegendItemForValue,
    getLegendItems,
    getPredefinedLegendItems,
    precisionRound,
} from './classify'

// Expectations follow the DHIS2 Maps app's own tests (src/util/__tests__/classify.spec.js).
describe('getLegendItemForValue', () => {
    const legendItems = [
        { startValue: 0, endValue: 10 },
        { startValue: 10, endValue: 20 },
        { startValue: 20, endValue: 30 },
    ]

    it('finds the class of a value, the last class including its end', () => {
        expect(getLegendItemForValue({ value: 15, legendItems })).toBe(legendItems[1])
        expect(getLegendItemForValue({ value: 30, legendItems })).toBe(legendItems[2])
        expect(getLegendItemForValue({ value: undefined, legendItems })).toBeUndefined()
    })

    it('clamps out-of-range values only when asked', () => {
        expect(getLegendItemForValue({ value: -5, legendItems, clamp: true })).toBe(legendItems[0])
        expect(getLegendItemForValue({ value: 35, legendItems, clamp: true })).toBe(legendItems[2])
        expect(getLegendItemForValue({ value: 35, legendItems })).toBeUndefined()
    })

    it('includes a non-last class end only for clusters', () => {
        expect(getLegendItemForValue({ value: 10, legendItems })).toBe(legendItems[1])
        expect(
            getLegendItemForValue({
                value: 10,
                legendItems,
                method: CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
            })
        ).toBe(legendItems[0])
    })

    it('prefers an isolated class and skips no-data and unclassified items', () => {
        const items = [
            { startValue: 5, endValue: 7, isIsolated: true },
            { startValue: 0, endValue: 10 },
            { isNoData: true },
        ]
        expect(getLegendItemForValue({ value: 6, legendItems: items })).toBe(items[0])
        expect(getLegendItemForValue({ value: 8, legendItems: items })).toBe(items[1])
    })
})

describe('getLegendItems', () => {
    it('makes equal intervals', () => {
        expect(
            getLegendItems([0, 25, 50, 75, 100], CLASSIFICATION_EQUAL_INTERVALS, {
                numClasses: 4,
            }).items
        ).toEqual([
            { startValue: 0, endValue: 25 },
            { startValue: 25, endValue: 50 },
            { startValue: 50, endValue: 75 },
            { startValue: 75, endValue: 100 },
        ])
    })

    it('makes equal counts (quantiles)', () => {
        expect(
            getLegendItems([1, 2, 3, 4, 5, 6], CLASSIFICATION_EQUAL_COUNTS, { numClasses: 3 }).items
        ).toEqual([
            { startValue: 1, endValue: 3 },
            { startValue: 3, endValue: 5 },
            { startValue: 5, endValue: 6 },
        ])
    })

    it('makes logarithmic classes from positive values only', () => {
        const { items } = getLegendItems([0, 25, 50, 75, 100], CLASSIFICATION_LOGARITHMIC, {
            numClasses: 4,
        })
        expect(items[0]?.startValue).toBeGreaterThan(0)
        expect(
            getLegendItems([-1, 0], CLASSIFICATION_LOGARITHMIC, { numClasses: 4 }).items
        ).toEqual([])
    })

    it('makes contiguous standard deviation classes around the mean', () => {
        const { items } = getLegendItems(
            [0, 10, 20, 50, 80, 90, 100],
            CLASSIFICATION_STANDARD_DEVIATION,
            { numClasses: 5 }
        )
        expect(items).toHaveLength(5)
        expect(items[0]?.startValue).toBeLessThan(0)
        expect(items[0]?.endValue).toBe(items[1]?.startValue)
    })

    it('keeps one class when all values are equal and drops duplicate classes', () => {
        expect(getLegendItems([4, 4], CLASSIFICATION_EQUAL_INTERVALS, { numClasses: 4 })).toEqual({
            items: [{ startValue: 4, endValue: 4 }],
        })
        const { items } = getLegendItems([5, 5, 5, 5, 5, 10, 10, 10], CLASSIFICATION_EQUAL_COUNTS, {
            numClasses: 5,
        })
        const keys = items.map(({ startValue, endValue }) => `${startValue}-${endValue}`)
        expect(new Set(keys).size).toBe(keys.length)
    })
})

describe('precisionRound', () => {
    it('matches d3-format', () => {
        // Outputs of d3-format's precisionRound for the same inputs.
        const cases: Array<[number, number, number]> = [
            [0.01, 1.01, 3],
            [0.1, 1.1, 2],
            [25, 100, 1],
            [0.5, 3, 2],
            [1.5, 7.5, 1],
            [1234, 98765, 2],
        ]
        for (const [step, max, expected] of cases) expect(precisionRound(step, max)).toBe(expected)
    })
})

describe('legend items', () => {
    it('sorts a predefined legend set', () => {
        expect(
            getPredefinedLegendItems([
                { name: 'High', startValue: 50, endValue: 100, color: '#f00' },
                { name: 'Low', startValue: 0, endValue: 50, color: '#0f0' },
            ]).map(({ name }) => name)
        ).toEqual(['Low', 'High'])
    })

    it('colors automatic classes with the color scale, default YlOrBr', () => {
        const { items } = getAutomaticLegendItems({ data: [0, 50, 100], classes: 3 })
        expect(items.map(({ color }) => color)).toEqual(['#fff7bc', '#fec44f', '#d95f0e'])
    })

    it('puts an isolated class first', () => {
        const { items } = getAutomaticLegendItems({
            data: [0, 1, 50, 100],
            classes: 2,
            colorScale: ['#aaa', '#bbb'],
            legendIsolated: { min: 0, max: 1, color: '#000' },
        })
        expect(items[0]).toMatchObject({ isIsolated: true, color: '#000' })
        expect(items.slice(1).map(({ color }) => color)).toEqual(['#aaa', '#bbb'])
    })
})
