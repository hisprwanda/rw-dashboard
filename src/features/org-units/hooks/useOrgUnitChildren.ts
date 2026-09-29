import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import type { InstanceConnection } from '@/shared/api'
import { orgUnitChildrenQueryOptions } from './orgUnitQueryOptions'

/** Children of one org unit; stays idle until `enabled` (e.g. the node is expanded). */
export const useOrgUnitChildren = (
    instance: InstanceConnection | undefined,
    parentId: string,
    enabled: boolean
) => {
    const engine = useDataEngine()
    const options = orgUnitChildrenQueryOptions(engine, instance, parentId)
    return useQuery({ ...options, queryFn: enabled ? options.queryFn : skipToken })
}
