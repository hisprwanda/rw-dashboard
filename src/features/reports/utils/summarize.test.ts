import { DISEASE_TYPE_ATTRIBUTE, EVENT_DATA_ELEMENTS as DE } from '../constants/bulletin'
import { categoryOf, summarizeCommunityEvents, summarizeEnrollments } from './summarize'

const enrollment = (orgUnit: string, type: string) => ({
    orgUnit,
    attributes: [{ attribute: DISEASE_TYPE_ATTRIBUTE, value: type }],
})

describe('summarizeEnrollments', () => {
    const rows = [
        enrollment('hf1', 'Measles'),
        enrollment('hf2', 'Measles'),
        enrollment('hf1', 'Maternal death'),
        enrollment('hf1', 'Neonatal death'),
        enrollment('hf2', 'Maternal death'),
        enrollment('hf3', 'Public health event'),
        { orgUnit: 'hf4', attributes: [] },
    ]
    const summary = summarizeEnrollments(rows, (id) => id.toUpperCase())

    it('categorizes enrollments', () => {
        expect(categoryOf('Maternal death')).toBe('deaths')
        expect(categoryOf('Public health event')).toBe('publicEvents')
        expect(categoryOf('Measles')).toBe('diseases')
    })

    it('counts cases per disease and facility', () => {
        expect(summary.diseaseMessages).toEqual(['2 cases of Measles reported by 2 HFs'])
        expect(summary.publicEventMessages).toEqual([
            '1 cases of Public health event reported by 1 HFs',
        ])
    })

    it('summarizes deaths by type and facility', () => {
        expect(summary.totalDeaths).toBe(3)
        expect(summary.deathsByType).toEqual([
            { name: 'Maternal death', value: 2 },
            { name: 'Neonatal death', value: 1 },
        ])
        expect(summary.deathsByFacility).toEqual([
            { name: 'HF1', value: 2 },
            { name: 'HF2', value: 1 },
        ])
        expect(summary.deathsDescription).toBe(
            '3 deaths were reported from 2 health facilities as follows:'
        )
        expect(summary.highlights).toHaveLength(3)
    })
})

describe('summarizeCommunityEvents', () => {
    const event = (orgUnit: string, values: Record<string, string>) => ({
        orgUnit,
        dataValues: Object.entries(values).map(([dataElement, value]) => ({ dataElement, value })),
    })

    it('adds malaria cases and counts signals per event', () => {
        const { messages, alerts } = summarizeCommunityEvents([
            event('v1', { [DE.malariaCode]: 'Malaria', [DE.malariaCases]: '4' }),
            event('v2', { [DE.malariaCode]: 'Malaria', [DE.malariaCases]: '1' }),
            event('v1', { [DE.signalCode]: 'Dog_bite', [DE.signalLocation]: 'Home' }),
            // An empty event must not repeat the previous signal.
            event('v3', {}),
        ])
        expect(messages).toEqual([
            '5 cases of Malaria reported by 2 villages',
            '1 cases of Dog bite-Home reported by 1 villages',
        ])
        expect(alerts).toEqual(['5 malaria cases', '1 Dog bite-Home cases'])
    })
})
