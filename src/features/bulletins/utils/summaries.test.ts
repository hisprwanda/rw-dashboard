import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import {
    buildCompletenessMatrix,
    categoryFor,
    completenessLevel,
    summarizeEventSignals,
    summarizeTrackerCases,
} from './summaries'

const groupBy = { id: 'attr', name: 'Disease' }
const rules = [
    { match: 'death', category: 'death' as const },
    { match: 'public health event', category: 'publicEvent' as const },
]
const enrollment = (orgUnit: string, value: string) => ({
    orgUnit,
    attributes: [{ attribute: 'attr', value }],
})

describe('categoryFor', () => {
    it('uses the first matching rule, else "case"', () => {
        expect(categoryFor('Maternal death', rules)).toBe('death')
        expect(categoryFor('Public health event', rules)).toBe('publicEvent')
        expect(categoryFor('Measles', rules)).toBe('case')
        expect(categoryFor('Measles', [])).toBe('case')
    })
})

describe('summarizeTrackerCases', () => {
    const summary = summarizeTrackerCases(
        [
            enrollment('hf1', 'Measles'),
            enrollment('hf2', 'Measles'),
            enrollment('hf1', 'Maternal death'),
            enrollment('hf1', 'Neonatal death'),
            enrollment('hf2', 'Maternal death'),
            enrollment('hf3', 'Public health event'),
            { orgUnit: 'hf4', attributes: [{ attribute: 'other', value: 'x' }] },
        ],
        { groupBy, rules },
        (id) => id.toUpperCase()
    )

    it('groups values into cases, deaths and public events', () => {
        expect(summary.cases).toEqual([
            { name: 'Measles', category: 'case', count: 2, orgUnits: 2 },
        ])
        expect(summary.deathsByType).toEqual([
            { name: 'Maternal death', value: 2 },
            { name: 'Neonatal death', value: 1 },
        ])
        expect(summary.totalDeaths).toBe(3)
        expect(summary.totalPublicEvents).toBe(1)
        expect(summary.totalEnrollments).toBe(6)
    })

    it('counts deaths per facility', () => {
        expect(summary.deathsByFacility).toEqual([
            { name: 'HF1', value: 2 },
            { name: 'HF2', value: 1 },
        ])
    })

    it('ignores rows without the grouping attribute', () => {
        expect(
            summarizeTrackerCases([enrollment('a', 'x')], { groupBy: null, rules }, String)
        ).toMatchObject({ totalEnrollments: 0, cases: [] })
    })
})

describe('summarizeEventSignals', () => {
    const event = (orgUnit: string, values: Record<string, string>) => ({
        orgUnit,
        dataValues: Object.entries(values).map(([dataElement, value]) => ({ dataElement, value })),
    })
    const events = [
        event('v1', { code: 'Malaria', cases: '4' }),
        event('v2', { code: 'Malaria', cases: '1' }),
        event('v1', { code: 'Dog bite', loc: 'Home', cases: '1' }),
        // An event without a code is skipped (never counted with a previous event's code).
        event('v3', {}),
    ]

    it('counts events per code and location', () => {
        const { signals, total } = summarizeEventSignals(events, {
            codeElement: { id: 'code', name: 'Code' },
            locationElement: { id: 'loc', name: 'Location' },
            countElement: null,
        })
        expect(signals).toEqual([
            { name: 'Malaria', count: 2, orgUnits: 2 },
            { name: 'Dog bite - Home', count: 1, orgUnits: 1 },
        ])
        expect(total).toBe(3)
    })

    it('sums the count element when configured', () => {
        const { signals } = summarizeEventSignals(events, {
            codeElement: { id: 'code', name: 'Code' },
            locationElement: null,
            countElement: { id: 'cases', name: 'Cases' },
        })
        expect(signals[0]).toEqual({ name: 'Malaria', count: 5, orgUnits: 2 })
    })
})

describe('completeness', () => {
    const header = (name: string) => ({
        name,
        column: name,
        valueType: 'TEXT',
        type: 'x',
        hidden: false,
        meta: true,
    })
    const response = {
        headers: [header('dx'), header('pe'), header('ou'), header('value')],
        rows: [
            ['ds.REPORTING_RATE', '2024W1', 'b', '80'],
            ['ds.REPORTING_RATE', '2024W2', 'b', '95.5'],
            ['ds.REPORTING_RATE', '2024W2', 'a', '40'],
        ],
        metaData: { items: { a: { name: 'Bo' }, b: { name: 'Kenema' } }, dimensions: {} },
    } as unknown as AnalyticsResponse

    it('builds org unit rows with one value per period', () => {
        expect(buildCompletenessMatrix(response, ['2024W1', '2024W2'])).toEqual([
            { id: 'a|ds.REPORTING_RATE', label: 'Bo', values: [null, 40] },
            { id: 'b|ds.REPORTING_RATE', label: 'Kenema', values: [80, 95.5] },
        ])
    })

    it('grades rates against the thresholds', () => {
        const thresholds = { good: 80, fair: 60 }
        expect(completenessLevel(95, thresholds)).toBe('good')
        expect(completenessLevel(70, thresholds)).toBe('fair')
        expect(completenessLevel(10, thresholds)).toBe('poor')
        expect(completenessLevel(null, thresholds)).toBe('none')
    })
})
