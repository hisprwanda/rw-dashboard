import type { useDataEngine } from '@dhis2/app-runtime'

/** The DHIS2 data engine (`useDataEngine()`), usable outside React in services. */
export type DataEngine = ReturnType<typeof useDataEngine>

type EngineQuery = Parameters<DataEngine['query']>[0]
type EngineResourceQuery = EngineQuery[string]
type EngineMutation = Parameters<DataEngine['mutate']>[0]

/** Query-string parameters as accepted by the data engine (static form only). */
export type QueryParams = Exclude<
    EngineResourceQuery['params'],
    ((...args: never[]) => unknown) | undefined
>

/** Mutation body as accepted by the data engine. */
export type MutationBody = Extract<EngineMutation, { type: 'create' }>['data']

/**
 * GET a single resource from the current DHIS2 instance.
 *
 * @example fetchResource<Me>(engine, 'me', { fields: 'id,authorities' })
 */
export const fetchResource = async <T>(
    engine: DataEngine,
    resource: string,
    params?: QueryParams,
    signal?: AbortSignal
): Promise<T> => {
    const response = await engine.query({ result: { resource, params } }, { signal })
    // Boundary cast: the engine returns untyped JSON; callers declare the shape.
    return response.result as unknown as T
}

export const createResource = (engine: DataEngine, resource: string, data: MutationBody) =>
    engine.mutate({ type: 'create', resource, data })

export const replaceResource = (
    engine: DataEngine,
    resource: string,
    id: string,
    data: MutationBody
) => engine.mutate({ type: 'replace', resource, id, data })

export const deleteResource = (engine: DataEngine, resource: string, id: string) =>
    engine.mutate({ type: 'delete', resource, id })
