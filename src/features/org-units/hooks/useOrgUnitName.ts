import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import type { InstanceConnection } from '@/shared/api'
import { orgUnitNameQuery } from './orgUnitQueries'

export const useOrgUnitName = (orgUnitId: string | undefined, instance?: InstanceConnection) => {
    const engine = useDataEngine()
    return useQuery({
        ...orgUnitNameQuery(engine, instance, orgUnitId ?? ''),
        enabled: !!orgUnitId,
    })
}
