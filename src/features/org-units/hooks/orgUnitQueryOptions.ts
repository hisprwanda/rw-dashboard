import { queryOptions } from '@tanstack/react-query'
import { createInstanceClient, type DataEngine, type InstanceConnection } from '@/shared/api'
import {
    fetchOrgUnitChildren,
    fetchOrgUnitMetadata,
    fetchOrgUnitName,
} from '../services/orgUnitService'
import { orgUnitKeys } from './queryKeys'

const TEN_MINUTES = 10 * 60 * 1000

/** Shared by `useQuery` and imperative `queryClient.fetchQuery` callers. */
export const orgUnitMetadataQueryOptions = (engine: DataEngine, instance?: InstanceConnection) =>
    queryOptions({
        queryKey: orgUnitKeys.metadata(instance),
        queryFn: ({ signal }) =>
            fetchOrgUnitMetadata(createInstanceClient(engine, instance), signal),
        staleTime: TEN_MINUTES,
    })

export const orgUnitChildrenQueryOptions = (
    engine: DataEngine,
    instance: InstanceConnection | undefined,
    parentId: string
) =>
    queryOptions({
        queryKey: orgUnitKeys.children(instance, parentId),
        queryFn: ({ signal }) =>
            fetchOrgUnitChildren(createInstanceClient(engine, instance), parentId, signal),
        staleTime: TEN_MINUTES,
    })

export const orgUnitNameQueryOptions = (
    engine: DataEngine,
    instance: InstanceConnection | undefined,
    orgUnitId: string
) =>
    queryOptions({
        queryKey: orgUnitKeys.name(instance, orgUnitId),
        queryFn: ({ signal }) =>
            fetchOrgUnitName(createInstanceClient(engine, instance), orgUnitId, signal),
        staleTime: Infinity,
    })
