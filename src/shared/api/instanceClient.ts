import { fetchResource, type DataEngine, type QueryParams } from './dhis2Client'
import { createExternalClient } from './externalClient'

/** Where a request should go: the DHIS2 instance hosting the app, or an external one. */
export interface InstanceConnection {
    isCurrentInstance: boolean
    url?: string
    token?: string
}

/**
 * One read API for both the current instance (data engine) and external instances
 * (axios + ApiToken). Features never branch on `isCurrentInstance` themselves.
 */
export interface InstanceClient {
    get<T>(resource: string, params?: QueryParams, signal?: AbortSignal): Promise<T>
}

export const createInstanceClient = (
    engine: DataEngine,
    instance?: InstanceConnection
): InstanceClient => {
    if (!instance || instance.isCurrentInstance) {
        return {
            get: (resource, params, signal) => fetchResource(engine, resource, params, signal),
        }
    }
    if (!instance.url || !instance.token) {
        throw new Error('An external instance needs both a url and a token.')
    }
    const client = createExternalClient({ url: instance.url, token: instance.token })
    return {
        get: async <T>(resource: string, params?: QueryParams, signal?: AbortSignal) =>
            (await client.get<T>(resource, { params, signal })).data,
    }
}
