import { fetchResource, type DataEngine } from '@/shared/api'

/** `GET systemSettings/applicationTitle` returns `{ applicationTitle: string }`. */
export const fetchApplicationTitle = async (engine: DataEngine, signal?: AbortSignal) => {
    const result = await fetchResource<{ applicationTitle?: string }>(
        engine,
        'systemSettings/applicationTitle',
        undefined,
        signal
    )
    return result.applicationTitle ?? ''
}
