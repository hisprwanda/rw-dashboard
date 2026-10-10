import i18n from '@dhis2/d2-i18n'
import type { AnalyticsParams, DisplayProperty } from '@/features/analytics'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { formatNumber } from '@/shared/utils/format'
import type { Dhis2Dimension, Dhis2MapView } from '../types/dhis2Object.types'
import {
    buildIsolatedLegendItem,
    CLASSIFICATION_LOGARITHMIC,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_SINGLE_COLOR,
    CLASSIFICATION_STANDARD_DEVIATION,
    DEFAULT_CLASSES,
    getAutomaticLegendItems,
    getLegendItemForValue,
    getPredefinedLegendItems,
    isRegularLegendItem,
    type IsolatedClass,
    type LegendItem,
} from './mapClassify'
import type { MapFeature } from './mapGeo'
import { formatRange, type MapLegend } from './mapLegend'

/**
 * The thematic (choropleth and bubble) layer of a DHIS2 map, ported from the DHIS2 Maps
 * app (`src/loaders/thematicLoader.js`, BSD-2-Clause): the same analytics request, classes,
 * colors and bubble sizes as in DHIS2.
 */

export const THEMATIC_BUBBLE = 'BUBBLE'
export const THEMATIC_RADIUS_LOW = 5
export const THEMATIC_RADIUS_HIGH = 30
export const THEMATIC_RADIUS_DEFAULT = 6
export const NO_DATA_COLOR = '#CCCCCC'

const ids = (axis: Dhis2Dimension | undefined) => (axis?.items ?? []).map(({ id }) => id)
const find = (axes: readonly Dhis2Dimension[] | undefined, dimension: string) =>
    (axes ?? []).find((axis) => axis.dimension === dimension)

const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined)
const number = (value: unknown) => (typeof value === 'number' ? value : undefined)

/** The data item of a thematic layer (its first column item). */
const dataItemOf = (view: Dhis2MapView) => view.columns?.[0]?.items?.[0]

/** The org units of a layer, as the `ou` dimension value (`ou1;LEVEL-2`). */
export const orgUnitParam = (view: Dhis2MapView) =>
    ids(find([...(view.rows ?? []), ...(view.columns ?? [])], 'ou')).join(';')

/** Filters other than the period (e.g. a category), as analytics `filter` values. */
const otherFilters = (view: Dhis2MapView) =>
    (view.filters ?? [])
        .filter(({ dimension, items }) => dimension !== 'pe' && items?.length)
        .map(
            ({ dimension, items }) => `${dimension}:${(items ?? []).map(({ id }) => id).join(';')}`
        )

/** Whether a thematic layer is drawn as one map (not a timeline or split by period). */
export const isSingleThematic = (view: Dhis2MapView) =>
    !view.renderingStrategy || view.renderingStrategy === 'SINGLE'

/** The analytics request of a thematic layer, or `null` without data or org units. */
export const thematicAnalyticsParams = (
    view: Dhis2MapView,
    displayProperty: DisplayProperty = 'NAME'
): AnalyticsParams | null => {
    const item = dataItemOf(view)
    const orgUnits = orgUnitParam(view)
    if (!item || !orgUnits) return null
    const dx = view.valueType === 'ds' ? `${item.id}.REPORTING_RATE` : item.id
    const periods = ids(find(view.filters, 'pe'))
    const startDate = text(view.startDate)?.slice(0, 10)
    const endDate = text(view.endDate)?.slice(0, 10)
    const aggregationType = text(view.aggregationType)
    const relativePeriodDate = text(view.relativePeriodDate)
    return {
        dimension: [`dx:${dx}`, `ou:${orgUnits}`],
        filter: [...(periods.length ? [`pe:${periods.join(';')}`] : []), ...otherFilters(view)],
        ...(!periods.length && startDate && endDate ? { startDate, endDate } : {}),
        displayProperty,
        ...(relativePeriodDate ? { relativePeriodDate } : {}),
        ...(aggregationType && aggregationType !== 'DEFAULT' ? { aggregationType } : {}),
        ...(view.eventStatus === 'COMPLETED' ? { completedOnly: true } : {}),
    }
}

interface LayerConfig {
    legendDecimalPlaces?: number
    legendIsolated?: IsolatedClass
    unclassifiedLegend?: { color: string; name?: string }
    noDataLegend?: { color: string; name?: string }
}

/** The JSON `config` string a map view keeps its extra legend options in. */
const parseConfig = (raw: unknown): LayerConfig => {
    if (typeof raw !== 'string' || !raw) return {}
    try {
        const parsed: unknown = JSON.parse(raw)
        return typeof parsed === 'object' && parsed ? (parsed as LayerConfig) : {}
    } catch {
        return {}
    }
}

/** A color scale saved as `#a,#b,#c` (or one color for single-color bubbles). */
const colorsOf = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((color): color is string => typeof color === 'string')
        : typeof value === 'string'
          ? value.split(',').filter(Boolean)
          : []

/** d3 `scaleSqrt().domain([min, max]).range([low, high]).clamp(true)`. */
const sqrtScale = (min: number, max: number, low: number, high: number) => {
    const root = (v: number) => Math.sign(v) * Math.sqrt(Math.abs(v))
    const a = root(min)
    const b = root(max)
    return (value: number) => {
        const t = b === a ? 0.5 : Math.min(1, Math.max(0, (root(value) - a) / (b - a)))
        return low + t * (high - low)
    }
}

export interface ThematicLayer {
    features: MapFeature[]
    legend: MapLegend
    isBubble: boolean
    /** No data for any org unit of the layer. */
    isEmpty: boolean
}

/**
 * The features of a thematic layer, colored (and sized, for bubbles) by their value, with
 * the layer's legend. Org units without data, or outside every class, are left out unless
 * the layer has a "no data" or "unclassified" class.
 */
export const styleThematic = ({
    view,
    analytics,
    features,
}: {
    view: Dhis2MapView
    analytics: AnalyticsResponse
    features: readonly MapFeature[]
}): ThematicLayer => {
    const config = parseConfig(view.config)
    const noDataColor = text(view.noDataColor)
    const noDataLegend = noDataColor
        ? { ...config.noDataLegend, color: noDataColor }
        : config.noDataLegend
    const colorScale = colorsOf(view.colorScale)
    const classes = number(view.classes) ?? DEFAULT_CLASSES
    const legendSetItems = view.legendSet?.legends ?? []
    const isPredefined = legendSetItems.length > 0
    const method = isPredefined ? CLASSIFICATION_PREDEFINED : number(view.method)
    const isSingleColor = method === CLASSIFICATION_SINGLE_COLOR
    const isBubble = view.thematicMapType === THEMATIC_BUBBLE
    const radiusLow = number(view.radiusLow) ?? THEMATIC_RADIUS_LOW
    const radiusHigh = number(view.radiusHigh) ?? THEMATIC_RADIUS_HIGH

    // Values by org unit
    const header = (name: string) => analytics.headers.findIndex((h) => h.name === name)
    const ouIndex = header('ou')
    const valueIndex = header('value')
    const valueById = new Map<string, number>()
    for (const row of analytics.rows) {
        const id = row[ouIndex]
        const value = Number.parseFloat(row[valueIndex] ?? '')
        if (id && !Number.isNaN(value)) valueById.set(id, value)
    }
    const ordered = [...valueById.values()].sort((a, b) => a - b)
    let minValue = ordered[0] ?? 0
    let maxValue = ordered.at(-1) ?? 0

    // Legend classes
    let items: LegendItem[] = []
    let valueFormat: ((value: number) => number) | undefined
    if (isPredefined) {
        items = getPredefinedLegendItems(legendSetItems)
    } else if (!isSingleColor) {
        const classification = getAutomaticLegendItems({
            data: ordered,
            method,
            classes,
            colorScale,
            legendDecimalPlaces: config.legendDecimalPlaces,
            legendIsolated: config.legendIsolated,
        })
        items = classification.items
        valueFormat = classification.valueFormat
    } else if (config.legendIsolated) {
        const { min, max } = config.legendIsolated
        items = [buildIsolatedLegendItem(config.legendIsolated)]
        const rest = ordered.filter((v) => v < min || v > max)
        minValue = rest[0] ?? minValue
        maxValue = rest.at(-1) ?? maxValue
    }
    if (isBubble && !isSingleColor) {
        const regular = items.filter(isRegularLegendItem)
        minValue = regular[0]?.startValue ?? minValue
        maxValue = regular.at(-1)?.endValue ?? maxValue
    }
    const unclassified: LegendItem | null = config.unclassifiedLegend
        ? {
              color: config.unclassifiedLegend.color,
              name: config.unclassifiedLegend.name || i18n.t('Unclassified'),
              isUnclassified: true,
          }
        : null
    const noData: LegendItem | null = noDataLegend
        ? {
              color: noDataLegend.color,
              name: noDataLegend.name || i18n.t('No data'),
              isNoData: true,
          }
        : null
    const legendItems = [
        ...items,
        ...(unclassified ? [unclassified] : []),
        ...(noData ? [noData] : []),
    ]
    const counts = new Map<LegendItem, number>()

    const radiusOf = sqrtScale(minValue, maxValue, radiusLow, radiusHigh)
    const singleColor = colorScale[0] ?? NO_DATA_COLOR
    const decimals = config.legendDecimalPlaces
    const format = (value: number) =>
        formatNumber(
            value,
            decimals === undefined
                ? undefined
                : {
                      minimumFractionDigits: decimals,
                      maximumFractionDigits: decimals,
                  }
        )

    const styled = features.flatMap((feature): MapFeature[] => {
        const value = valueById.get(feature.id)
        const item = getLegendItemForValue({
            value,
            valueFormat,
            method,
            legendItems,
            clamp:
                !isPredefined &&
                method !== CLASSIFICATION_LOGARITHMIC &&
                method !== CLASSIFICATION_STANDARD_DEVIATION,
        })
        const isNoData = value === undefined
        const isUnclassified = !isSingleColor && !item && !isNoData
        if (isNoData && !noData) return []
        if (isUnclassified && !unclassified) return []
        const legendItem = item ?? (isNoData ? noData : isUnclassified ? unclassified : null)
        if (legendItem) counts.set(legendItem, (counts.get(legendItem) ?? 0) + 1)
        const special = !!item?.isIsolated || isNoData || isUnclassified
        return [
            {
                ...feature,
                properties: {
                    ...feature.properties,
                    color: legendItem?.color ?? singleColor,
                    radius:
                        special || value === undefined
                            ? THEMATIC_RADIUS_DEFAULT
                            : radiusOf(value) || THEMATIC_RADIUS_DEFAULT,
                    value: value === undefined ? undefined : formatNumber(value),
                    legend: legendItem?.name,
                    range: legendItem ? formatRange(legendItem, format) : undefined,
                },
            },
        ]
    })

    // Names from the analytics metadata
    const names = analytics.metaData.items
    const dataItem = dataItemOf(view)
    const periodIds = ids(find(view.filters, 'pe'))
    const start = text(view.startDate)?.slice(0, 10)
    const end = text(view.endDate)?.slice(0, 10)
    const filters = (view.filters ?? [])
        .filter(({ dimension, items: values }) => dimension !== 'pe' && values?.length)
        .map(
            ({ dimension, items: values }) =>
                `${names[dimension]?.name ?? dimension}: ${(values ?? [])
                    .map(({ id }) => names[id]?.name ?? id)
                    .join(', ')}`
        )

    return {
        features: styled,
        isBubble,
        isEmpty: valueById.size === 0,
        legend: {
            title:
                (dataItem && (names[dataItem.id]?.name ?? dataItem.name)) ||
                i18n.t('Thematic layer'),
            period: periodIds.length
                ? periodIds.map((id) => names[id]?.name ?? id).join(', ')
                : start && end
                  ? `${start} – ${end}`
                  : undefined,
            entries: legendItems.map((item) => ({
                name: item.name,
                range: formatRange(item, format),
                color: item.color,
                count: counts.get(item) ?? 0,
            })),
            ...(filters.length ? { filters } : {}),
            ...(isBubble ? { bubbles: { radiusLow, radiusHigh, minValue, maxValue } } : {}),
        },
    }
}
