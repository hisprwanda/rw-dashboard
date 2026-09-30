/** HTTP status of a data engine or axios error, if any. */
export const httpStatusOf = (error: unknown): number | undefined => {
    if (typeof error !== 'object' || error === null) return undefined
    const details = 'details' in error ? (error as { details?: unknown }).details : undefined
    if (typeof details === 'object' && details !== null && 'httpStatusCode' in details) {
        const status = (details as { httpStatusCode?: unknown }).httpStatusCode
        if (typeof status === 'number') return status
    }
    const response = 'response' in error ? (error as { response?: unknown }).response : undefined
    if (typeof response === 'object' && response !== null && 'status' in response) {
        const status = (response as { status?: unknown }).status
        if (typeof status === 'number') return status
    }
    return undefined
}

export const isNotFound = (error: unknown) => httpStatusOf(error) === 404
