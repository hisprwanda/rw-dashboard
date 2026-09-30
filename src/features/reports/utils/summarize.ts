import i18n from '@dhis2/d2-i18n'
import { DISEASE_TYPE_ATTRIBUTE, EVENT_DATA_ELEMENTS } from '../constants/bulletin'
import type { NameValue, TrackedEntityRow, TrackerEventRow } from '../types/bulletin.types'

const pretty = (text: string) => text.replace(/_/g, ' ')

const increment = (counts: Map<string, number>, key: string, by = 1) =>
    counts.set(key, (counts.get(key) ?? 0) + by)

const addTo = (sets: Map<string, Set<string>>, key: string, orgUnit: string) => {
    const set = sets.get(key) ?? new Set<string>()
    set.add(orgUnit)
    sets.set(key, set)
}

export type EnrollmentCategory = 'deaths' | 'publicEvents' | 'diseases'

export const categoryOf = (diseaseType: string): EnrollmentCategory => {
    const value = diseaseType.toLowerCase()
    if (value.includes('death')) return 'deaths'
    if (value.includes('public health event')) return 'publicEvents'
    return 'diseases'
}

/** The immediate reportable events of the week, grouped as the bulletin needs them. */
export const summarizeEnrollments = (
    rows: readonly TrackedEntityRow[],
    orgUnitName: (id: string) => string
) => {
    const diseases = new Map<string, number>()
    const publicEvents = new Map<string, number>()
    const deathTypes = new Map<string, number>()
    const deathsByUnit = new Map<string, Map<string, number>>()
    const unitsPerType = new Map<string, Set<string>>()

    for (const row of rows) {
        const type = row.attributes?.find((a) => a.attribute === DISEASE_TYPE_ATTRIBUTE)?.value
        if (!type) continue
        addTo(unitsPerType, type, row.orgUnit)
        const category = categoryOf(type)
        if (category === 'deaths') {
            increment(deathTypes, type)
            const unit = deathsByUnit.get(row.orgUnit) ?? new Map<string, number>()
            increment(unit, type)
            deathsByUnit.set(row.orgUnit, unit)
        } else if (category === 'publicEvents') increment(publicEvents, type)
        else increment(diseases, type)
    }

    const unitsOf = (type: string) => unitsPerType.get(type)?.size ?? 0
    const diseaseMessages = [...diseases].map(([type, count]) =>
        i18n.t('{{count}} cases of {{name}} reported by {{facilities}} HFs', {
            count,
            name: pretty(type),
            facilities: unitsOf(type),
        })
    )
    const publicEventMessages = [...publicEvents].map(([type, count]) =>
        i18n.t('{{count}} cases of {{name}} reported by {{facilities}} HFs', {
            count,
            name: type,
            facilities: unitsOf(type),
        })
    )

    const deathsByFacility: NameValue[] = []
    const deathMessages: string[] = []
    for (const [unit, types] of deathsByUnit) {
        const total = [...types.values()].reduce((sum, n) => sum + n, 0)
        const details = [...types]
            .map(([type, n]) => i18n.t('{{count}} were {{type}}', { count: n, type }))
            .join(', ')
        deathMessages.push(
            i18n.t('{{count}} deaths were reported by {{facility}} ({{details}})', {
                count: total,
                facility: orgUnitName(unit),
                details,
            })
        )
        deathsByFacility.push({ name: orgUnitName(unit), value: total })
    }

    const totalDeaths = [...deathTypes.values()].reduce((sum, n) => sum + n, 0)
    const totalPublicEvents = [...publicEvents.values()].reduce((sum, n) => sum + n, 0)
    const deathsByType = [...deathTypes]
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    const topDeathTypes = deathsByType
        .slice(0, 2)
        .map((d) => d.name)
        .join(' and ')

    const highlights: string[] = []
    if (rows.length) {
        highlights.push(
            i18n.t(
                '{{count}} immediate reportable events were notified by health facilities countrywide. These include {{diseases}}.',
                { count: rows.length, diseases: [...diseases.keys()].join(', ') }
            )
        )
    }
    if (totalDeaths) {
        highlights.push(
            i18n.t(
                'A total of {{count}} deaths were reported through the electronic Integrated Disease Surveillance and Response (eIDSR) system. Most of the deaths were {{types}}.',
                { count: totalDeaths, types: topDeathTypes }
            )
        )
    }
    if (totalPublicEvents) {
        highlights.push(
            i18n.t('A total of {{count}} public events were reported.', {
                count: totalPublicEvents,
            })
        )
    }

    return {
        diseaseMessages,
        deathMessages,
        publicEventMessages,
        highlights,
        totalDeaths,
        totalEnrollments: rows.length,
        deathsByType,
        deathsByFacility,
        deathsDescription: i18n.t(
            '{{count}} deaths were reported from {{facilities}} health facilities as follows:',
            { count: totalDeaths, facilities: deathsByUnit.size }
        ),
        pieDescription: i18n.t(
            'As summarized in the Pie Chart below, a total number of {{count}} deaths were reported through the electronic Integrated Disease Surveillance and Response (eIDSR) system. {{details}}.',
            {
                count: totalDeaths,
                details: deathsByType
                    .map((d) =>
                        i18n.t('{{count}} ({{percent}}%) were {{type}}', {
                            count: d.value,
                            percent: ((d.value / totalDeaths) * 100).toFixed(2),
                            type: d.name,
                        })
                    )
                    .join(', '),
            }
        ),
    }
}

/**
 * Community signals and malaria reports. Each event is read on its own (the old code
 * kept the previous event's values, so events without a signal were counted again).
 */
export const summarizeCommunityEvents = (events: readonly TrackerEventRow[]) => {
    const counts = new Map<string, number>()
    const units = new Map<string, Set<string>>()
    const malariaUnits = new Set<string>()
    let malariaCases = 0

    for (const event of events) {
        const value = (id: string) => event.dataValues?.find((d) => d.dataElement === id)?.value
        const signal = value(EVENT_DATA_ELEMENTS.signalCode)
        const location = value(EVENT_DATA_ELEMENTS.signalLocation)
        const malaria = value(EVENT_DATA_ELEMENTS.malariaCode)
        if (signal && location) {
            const key = `${signal}-${location}`
            increment(counts, key)
            addTo(units, key, event.orgUnit)
        }
        if (malaria === 'Malaria') {
            malariaCases += Number.parseInt(value(EVENT_DATA_ELEMENTS.malariaCases) ?? '', 10) || 0
            malariaUnits.add(event.orgUnit)
        } else if (malaria) {
            increment(counts, malaria)
            addTo(units, malaria, event.orgUnit)
        }
    }

    const messages: string[] = []
    const alerts: string[] = []
    if (malariaCases > 0) {
        messages.push(
            i18n.t('{{count}} cases of Malaria reported by {{villages}} villages', {
                count: malariaCases,
                villages: malariaUnits.size,
            })
        )
        alerts.push(i18n.t('{{count}} malaria cases', { count: malariaCases }))
    }
    for (const [key, count] of counts) {
        messages.push(
            i18n.t('{{count}} cases of {{name}} reported by {{villages}} villages', {
                count,
                name: pretty(key),
                villages: units.get(key)?.size ?? 0,
            })
        )
        alerts.push(i18n.t('{{count}} {{name}} cases', { count, name: pretty(key) }))
    }
    return { messages, alerts }
}
