import type { InstanceClient } from '@/shared/api'

/** A legend set with its classes, in the shape the DHIS2 chart engine reads. */
export interface ChartLegendSet {
    id: string
    name: string
    legends: Array<{ name: string; startValue: number; endValue: number; color: string }>
}

export const fetchChartLegendSets = async (
    client: InstanceClient,
    signal?: AbortSignal
): Promise<ChartLegendSet[]> => {
    const { legendSets } = await client.get<{ legendSets?: ChartLegendSet[] }>(
        'legendSets',
        {
            fields: 'id,displayName~rename(name),legends[displayName~rename(name),startValue,endValue,color]',
            paging: false,
        },
        signal
    )
    return legendSets ?? []
}
