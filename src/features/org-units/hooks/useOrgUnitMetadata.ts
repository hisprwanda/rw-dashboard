import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import type { InstanceConnection } from '@/shared/api'
import { orgUnitMetadataQuery } from './orgUnitQueries'

/**
 * Org-unit tree, levels, groups and the user's org units for an instance
 * (the current one when `instance` is omitted or `isCurrentInstance`).
 */
export const useOrgUnitMetadata = (instance?: InstanceConnection) => {
    const engine = useDataEngine()
    return useQuery(orgUnitMetadataQuery(engine, instance))
}
