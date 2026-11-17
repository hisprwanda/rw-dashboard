import i18n from '@dhis2/d2-i18n'
import type { MapFeature } from './mapGeo'
import type { MapLegend, MapLegendEntry } from './mapLegend'

/**
 * Org unit (boundary) and facility layers of a DHIS2 map, styled as in the DHIS2 Maps app
 * (`src/util/orgUnits.js`, BSD-2-Clause): boundaries thinner at lower levels, facilities as
 * points or group symbols, optionally colored by an org unit group set.
 */

export const ORG_UNIT_COLOR = '#333333'
export const ORG_UNIT_RADIUS = 6

/** The Maps app's colors for groups that have none (in order, then random). */
const QUALITATIVE_COLORS = [
    '#1f78b4',
    '#ff7f00',
    '#33a02c',
    '#a6cee3',
    '#b2df8a',
    '#fb9a99',
    '#fdbf6f',
    '#cab2d6',
    '#ffff99',
    '#b15928',
    '#6a3d9a',
    '#e31a1c',
]

export interface OrgUnitGroup {
    id: string
    name: string
    color?: string
    symbol?: string
}

export interface OrgUnitGroupSet {
    id: string
    name?: string
    organisationUnitGroups: OrgUnitGroup[]
}

/** Groups sorted by name, with the default color and symbol of those lacking one. */
export const withGroupDefaults = (groups: readonly OrgUnitGroup[]): OrgUnitGroup[] => {
    const sorted = [...groups].sort((a, b) => a.name.localeCompare(b.name))
    const withoutColor = sorted.filter((group) => !group.color)
    const withoutSymbol = sorted.filter((group) => !group.symbol)
    return sorted.map((group) => {
        const colorIndex = withoutColor.indexOf(group)
        const symbolIndex = withoutSymbol.indexOf(group)
        return {
            ...group,
            color: group.color ?? QUALITATIVE_COLORS[colorIndex % QUALITATIVE_COLORS.length],
            symbol: group.symbol ?? (symbolIndex < 5 ? `${21 + symbolIndex}.png` : '25.png'),
        }
    })
}

/** Image of a group symbol on the DHIS2 server. */
export const symbolUrl = (baseUrl: string, symbol: string) =>
    `${baseUrl.replace(/\/$/, '')}/images/orgunitgroup/${symbol}`

interface StyleOptions {
    features: readonly MapFeature[]
    /** Group set the layer is styled by, if any. */
    groupSet?: OrgUnitGroupSet
    /** Names of the org unit levels (org unit layers); absent for facility layers. */
    levelNames?: Record<number, string>
    /** `COLOR` or `SYMBOL` (facilities default to symbols when styled by a group set). */
    styleType?: string
    color?: string
    radius?: number
    /** Base URL of the instance serving the group symbols. */
    baseUrl: string
    unclassified?: { color: string; name?: string }
    title: string
}

export interface OrgUnitLayer {
    features: MapFeature[]
    legend: MapLegend
}

/** Org unit or facility features with their color, line weight, radius or symbol. */
export const styleOrgUnits = ({
    features,
    groupSet,
    levelNames,
    styleType,
    color = ORG_UNIT_COLOR,
    radius = ORG_UNIT_RADIUS,
    baseUrl,
    unclassified,
    title,
}: StyleOptions): OrgUnitLayer => {
    const isFacility = !levelNames
    const useColor = (styleType ?? (isFacility ? 'SYMBOL' : 'COLOR')) === 'COLOR'
    const groups = groupSet ? withGroupDefaults(groupSet.organisationUnitGroups) : []
    const levels = [...new Set(features.map(({ properties }) => properties.level))].sort(
        (a, b) => a - b
    )
    const weightOf = (level: number) => (levels.length - levels.indexOf(level)) ** 1.2

    const styled = features.flatMap((feature): MapFeature[] => {
        const groupId = groupSet ? feature.properties.dimensions?.[groupSet.id] : undefined
        const group = groups.find(({ id }) => id === groupId)
        const isUnclassified = !!groupSet && !group
        const properties: MapFeature['properties'] = {
            ...feature.properties,
            ...(feature.geometry.type === 'Point' ? { radius } : {}),
            ...(!isFacility ? { weight: weightOf(feature.properties.level) } : {}),
        }
        if (isUnclassified && unclassified) properties.color = unclassified.color
        else if (group && useColor) properties.color = group.color
        else if (group?.symbol) properties.iconUrl = symbolUrl(baseUrl, group.symbol)
        // Styled by a group set: org units in none of its groups are left out.
        if (groupSet && !properties.color && !properties.iconUrl) return []
        return [{ ...feature, properties }]
    })

    const inGroup = (id: string | undefined) =>
        styled.filter(({ properties }) => groupSet && properties.dimensions?.[groupSet.id] === id)
            .length
    const groupEntries: MapLegendEntry[] = groups.map(({ id, name, color: groupColor, symbol }) =>
        useColor
            ? { name, color: groupColor, count: inGroup(id) }
            : { name, image: symbol ? symbolUrl(baseUrl, symbol) : undefined, count: inGroup(id) }
    )
    if (unclassified && groupSet) {
        groupEntries.push({
            name: unclassified.name || i18n.t('Unclassified'),
            color: unclassified.color,
            count: styled.filter(({ properties }) => properties.color === unclassified.color)
                .length,
        })
    }
    const levelEntries: MapLegendEntry[] = isFacility
        ? groupSet
            ? []
            : [{ name: i18n.t('Facility'), color, radius, count: styled.length }]
        : levels.map((level) => ({
              name: levelNames?.[level] ?? i18n.t('Level {{level}}', { level }),
              color,
              weight: weightOf(level),
              count: styled.filter(({ properties }) => properties.level === level).length,
          }))

    return {
        features: styled,
        legend: {
            title,
            ...(groupSet?.name ? { unit: groupSet.name } : {}),
            entries: groupEntries.length ? groupEntries : levelEntries,
        },
    }
}
