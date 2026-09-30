import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { fetchModules } from '../services/navigationService'
import { navigationKeys } from './queryKeys'

/** Installed apps for the apps menu; only fetched once the menu is opened. */
export const useModules = (enabled: boolean) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: navigationKeys.modules(),
        queryFn: ({ signal }) => fetchModules(engine, signal),
        enabled,
        staleTime: Infinity,
    })
}
