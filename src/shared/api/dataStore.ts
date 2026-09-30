import type { DataStoreEntriesResponse, DataStoreEntry } from '../types/dhis2.types'
import {
    createResource,
    deleteResource,
    fetchResource,
    replaceResource,
    type DataEngine,
    type MutationBody,
} from './dhis2Client'

/**
 * Typed CRUD for one dataStore namespace on the current instance.
 *
 * @example
 * const dashboards = dataStoreService<Dashboard>(env.dashboardStore)
 * const all = await dashboards.list(engine)
 */
export const dataStoreService = <T extends MutationBody>(namespace: string) => {
    const resource = `dataStore/${namespace}`

    return {
        /** All entries with their values (`?fields=.`), unpaged. */
        list: async (engine: DataEngine, signal?: AbortSignal): Promise<DataStoreEntry<T>[]> => {
            const response = await fetchResource<DataStoreEntriesResponse<T>>(
                engine,
                resource,
                { fields: '.', paging: false },
                signal
            )
            return response.entries ?? []
        },
        get: (engine: DataEngine, key: string, signal?: AbortSignal): Promise<T> =>
            fetchResource<T>(engine, `${resource}/${key}`, undefined, signal),
        create: (engine: DataEngine, key: string, value: T) =>
            createResource(engine, `${resource}/${key}`, value),
        update: (engine: DataEngine, key: string, value: T) =>
            replaceResource(engine, resource, key, value),
        remove: (engine: DataEngine, key: string) => deleteResource(engine, resource, key),
    }
}
