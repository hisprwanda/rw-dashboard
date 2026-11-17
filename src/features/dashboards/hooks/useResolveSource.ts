import { useMemo } from 'react'
import { CURRENT_INSTANCE_ID, useDataSources } from '@/features/data-sources'
import { useApplicationTitle } from '@/features/system'
import type { ResolveSource } from '../utils/visualQueries'

/**
 * Resolves the data source ids saved on dashboard items to connections; `resolve` is
 * `undefined` while the saved data sources load.
 */
export const useResolveSource = () => {
    const applicationTitle = useApplicationTitle()
    const sources = useDataSources()
    const resolve = useMemo<ResolveSource | undefined>(() => {
        if (!sources.data) return undefined
        return (id) =>
            !id || id === CURRENT_INSTANCE_ID
                ? { isCurrentInstance: true, instanceName: applicationTitle }
                : sources.data?.find((entry) => entry.key === id)?.value
    }, [sources.data, applicationTitle])
    return { resolve, isLoading: sources.isLoading, error: sources.error }
}
