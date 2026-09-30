import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { createInstanceClient, type InstanceConnection } from '@/shared/api'
import {
    fetchDataSets,
    fetchProgramFields,
    fetchPrograms,
    fetchUiLocales,
} from '../services/metadataService'
import { bulletinKeys } from './queryKeys'

const TEN_MINUTES = 10 * 60 * 1000

/** Programs of the bulletin's instance (tracker or event programs). */
export const usePrograms = (
    instance: InstanceConnection | undefined,
    programType?: 'WITH_REGISTRATION' | 'WITHOUT_REGISTRATION'
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: bulletinKeys.programs(instance, programType),
        queryFn: instance
            ? ({ signal }) =>
                  fetchPrograms(createInstanceClient(engine, instance), programType, signal)
            : skipToken,
        staleTime: TEN_MINUTES,
    })
}

/** Attributes and data elements of one program; idle without a program. */
export const useProgramFields = (
    instance: InstanceConnection | undefined,
    programId: string | undefined
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: bulletinKeys.programFields(instance, programId ?? ''),
        queryFn:
            instance && programId
                ? ({ signal }) =>
                      fetchProgramFields(createInstanceClient(engine, instance), programId, signal)
                : skipToken,
        staleTime: TEN_MINUTES,
    })
}

export const useDataSets = (instance: InstanceConnection | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: bulletinKeys.dataSets(instance),
        queryFn: instance
            ? ({ signal }) => fetchDataSets(createInstanceClient(engine, instance), signal)
            : skipToken,
        staleTime: TEN_MINUTES,
    })
}

/** Interface languages of the current instance. */
export const useUiLocales = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: ['bulletinMetadata', 'uiLocales'],
        queryFn: ({ signal }) => fetchUiLocales(createInstanceClient(engine), signal),
        staleTime: Infinity,
    })
}
