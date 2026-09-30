import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { visualService } from '../services/visualService'
import { visualKeys } from './queryKeys'

/** One saved visualization; idle while `id` is undefined (new visual). */
export const useVisual = (id: string | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: visualKeys.detail(id ?? ''),
        queryFn: id ? ({ signal }) => visualService.get(engine, id, signal) : skipToken,
    })
}
