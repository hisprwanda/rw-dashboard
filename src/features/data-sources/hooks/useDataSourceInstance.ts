import type { InstanceConnection } from '@/shared/api'
import { CURRENT_INSTANCE_ID } from '../constants'
import { useDataSources } from './useDataSources'

const CURRENT_INSTANCE: InstanceConnection = { isCurrentInstance: true }

/**
 * Resolves a saved `dataSourceId` (as stored on visuals, maps, dashboards) to a
 * connection. `notFound` means the data source was deleted or is not shared.
 */
export const useDataSourceInstance = (dataSourceId: string | undefined) => {
    const isCurrent = !dataSourceId || dataSourceId === CURRENT_INSTANCE_ID
    const { data: sources, isLoading } = useDataSources()
    if (isCurrent) return { instance: CURRENT_INSTANCE, isLoading: false, notFound: false }
    const instance = sources?.find((entry) => entry.key === dataSourceId)?.value
    return { instance, isLoading, notFound: !isLoading && !instance }
}
