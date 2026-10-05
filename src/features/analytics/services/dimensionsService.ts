import type { InstanceClient } from '@/shared/api'

/** A dimension of the instance (a category, a group set…). */
export interface DimensionSummary {
    id: string
    displayName: string
}

/** An item of a dimension. */
export type DimensionItem = DimensionSummary

/** Dimensions with their own picker (data, period, org unit) are not "dynamic". */
const PREDEFINED = ['dx', 'pe', 'ou']

/** The dynamic dimensions: categories, category option group sets, org unit group sets… */
export const fetchDimensions = async (
    client: InstanceClient,
    signal?: AbortSignal
): Promise<DimensionSummary[]> => {
    const { dimensions } = await client.get<{ dimensions: DimensionSummary[] }>(
        'dimensions',
        { fields: 'id,displayName', paging: false },
        signal
    )
    return dimensions.filter(({ id }) => !PREDEFINED.includes(id))
}

export const fetchDimensionItems = async (
    client: InstanceClient,
    dimensionId: string,
    signal?: AbortSignal
): Promise<DimensionItem[]> => {
    const { items } = await client.get<{ items: DimensionItem[] }>(
        `dimensions/${dimensionId}/items`,
        { fields: 'id,displayName', paging: false },
        signal
    )
    return items
}
