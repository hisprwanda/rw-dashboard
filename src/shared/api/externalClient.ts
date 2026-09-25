import axios, { AxiosError, type AxiosInstance } from 'axios'
import type { QueryParams } from './dhis2Client'
import { serializeParams } from './serializeParams'

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status?: number,
        readonly details?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export interface ExternalInstance {
    url: string
    token: string
}

const toApiError = (error: unknown): ApiError => {
    if (error instanceof AxiosError) {
        const data: unknown = error.response?.data
        const message =
            typeof data === 'object' && data !== null && 'message' in data
                ? String(data.message)
                : error.message
        return new ApiError(message, error.response?.status, data)
    }
    return new ApiError(error instanceof Error ? error.message : 'Unknown error')
}

/** Axios client for another DHIS2 instance, authenticated with a personal access token. */
export const createExternalClient = ({ url, token }: ExternalInstance): AxiosInstance => {
    const client = axios.create({
        baseURL: `${url.replace(/\/+$/, '')}/api`,
        headers: { Authorization: `ApiToken ${token}` },
        paramsSerializer: { serialize: (params: QueryParams) => serializeParams(params) },
    })
    client.interceptors.response.use(undefined, (error: unknown) =>
        Promise.reject(toApiError(error))
    )
    return client
}
