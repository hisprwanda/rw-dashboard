import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { fetchResource, isNotFound } from '@/shared/api'
import { env } from '@/shared/constants/env'

/** The old fixed-layout bulletin texts, if this instance still has them (`null` if not). */
export const useLegacyTemplate = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: ['bulletins', 'legacyTemplate'],
        queryFn: async ({ signal }) => {
            try {
                return await fetchResource<unknown>(
                    engine,
                    `dataStore/${env.bulletinStore}/${env.bulletinTemplateKey}`,
                    undefined,
                    signal
                )
            } catch (error) {
                if (isNotFound(error)) return null
                throw error
            }
        },
        staleTime: Infinity,
        retry: false,
    })
}
