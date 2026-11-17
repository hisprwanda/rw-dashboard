import {
    applyLayout,
    parseAnalyticsDimensions,
    withDataItems,
    type SourceQuery,
} from '@/features/analytics'
import type { InstanceConnection } from '@/shared/api'
import type { DashboardVisualItem } from '../types/dashboard.types'

/** A saved data source id resolved to a connection (`undefined`: deleted or unshared). */
export type ResolveSource = (
    dataSourceId: string
) => (InstanceConnection & { instanceName: string }) | undefined

export interface VisualItemQueries {
    queries: SourceQuery[]
    /** Every data item of the visual, in its saved order. */
    dataOrder: string[]
    /** A data source of the visual is not available. */
    missing: boolean
}

/**
 * The analytics of a dashboard visual, one query per data source: the saved query holds
 * every data item, each additional source reads its own and the main source the rest.
 */
export const visualItemQueries = (
    item: DashboardVisualItem,
    resolve: ResolveSource
): VisualItemQueries | undefined => {
    const saved = item.visualQuery?.myData?.params
    if (!saved) return undefined
    const params = applyLayout(saved, item.analyticsPayloadDeterminer)
    const dataOrder = parseAnalyticsDimensions(saved.dimension).dx ?? []

    const claimed = new Set<string>()
    const additional = (item.additionalSources ?? []).map(({ dataSourceId, dataItems }) => {
        const ids = dataItems.map(({ id }) => id).filter((id) => !claimed.has(id))
        ids.forEach((id) => claimed.add(id))
        return { dataSourceId, ids }
    })
    const main = dataOrder.filter((id) => !claimed.has(id))

    let missing = false
    const queries: SourceQuery[] = []
    for (const { dataSourceId, ids } of [
        { dataSourceId: item.dataSourceId, ids: main },
        ...additional,
    ]) {
        const source = resolve(dataSourceId)
        if (!source) missing = true
        else if (ids.length) {
            const { instanceName, ...instance } = source
            queries.push({
                instance,
                instanceName,
                // The DHIS2 renderers read the dimension types of the metadata.
                dataParams: { ...withDataItems(params, ids), includeMetadataDetails: true },
            })
        }
    }
    return { queries, dataOrder, missing }
}
