import type { AnalyticsMetaData, AnalyticsMetaDataItem } from '@/shared/types/dhis2.types'

export type PeriodType = 'month' | 'quarter' | 'year' | 'other'

export interface MetadataItem extends AnalyticsMetaDataItem {
    uid: string
    startDate?: string
    endDate?: string
    dimensionType?: string
}

export interface PeriodItem extends MetadataItem {
    startDate: string
    endDate: string
    type: PeriodType
}

export interface TransformedDimension<T> {
    ids: string[]
    items: T[]
}

/** Analytics metadata grouped by dimension, for titles, legends and subtitles. */
export interface TransformedMetadata {
    periods: TransformedDimension<PeriodItem>
    dataElements: TransformedDimension<MetadataItem>
    orgUnits: TransformedDimension<MetadataItem>
    categoryOptions: TransformedDimension<MetadataItem>
    dimensionTypes: Record<string, string>
    original: Partial<AnalyticsMetaData>
}

type ItemMap = Record<string, Partial<MetadataItem>>

const periodTypeOf = (id: string): PeriodType => {
    if (/^\d{6}$/.test(id)) return 'month'
    if (/^\d{4}Q[1-4]$/.test(id)) return 'quarter'
    if (/^\d{4}$/.test(id)) return 'year'
    return 'other'
}

/** Missing items fall back to their id as name, so the UI never shows blanks. */
const itemOf = (items: ItemMap, id: string): MetadataItem => ({
    ...items[id],
    uid: items[id]?.uid ?? id,
    name: items[id]?.name ?? id,
})

const dimension = <T>(ids: string[] | undefined, toItem: (id: string) => T) => ({
    ids: ids ?? [],
    items: (ids ?? []).map(toItem),
})

export const transformMetadataLabels = (
    metaData?: Partial<AnalyticsMetaData> | null
): TransformedMetadata => {
    const items: ItemMap = metaData?.items ?? {}
    const dims = metaData?.dimensions ?? {}
    const dimensionTypes = Object.fromEntries(
        Object.entries(items)
            .filter(([, item]) => item?.dimensionType)
            .map(([key, item]) => [key, String(item.dimensionType)])
    )
    return {
        periods: dimension(dims.pe, (id) => ({
            ...itemOf(items, id),
            startDate: items[id]?.startDate ?? '',
            endDate: items[id]?.endDate ?? '',
            type: periodTypeOf(id),
        })),
        dataElements: dimension(dims.dx, (id) => itemOf(items, id)),
        orgUnits: dimension(dims.ou, (id) => itemOf(items, id)),
        categoryOptions: dimension(dims.co, (id) => itemOf(items, id)),
        dimensionTypes,
        original: metaData ?? { items: {}, dimensions: {} },
    }
}

type DimensionKey = 'periods' | 'dataElements' | 'orgUnits' | 'categoryOptions'

export const getDimensionItems = (
    metadata: TransformedMetadata | undefined,
    key: DimensionKey
): MetadataItem[] => metadata?.[key].items ?? []
