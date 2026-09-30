import type { SharingCandidate } from '../types/common.types'
import type { IdentifiableObject } from '../types/dhis2.types'
import { fetchResource, type DataEngine } from './dhis2Client'

interface SharingSearchResponse {
    users?: IdentifiableObject[]
    userGroups?: IdentifiableObject[]
}

const nameOf = (item: IdentifiableObject) => item.displayName ?? item.name ?? item.id

/** Users and user groups matching `key` (for the sharing dialog). */
export const searchSharingCandidates = async (
    engine: DataEngine,
    key: string,
    signal?: AbortSignal
): Promise<SharingCandidate[]> => {
    const response = await fetchResource<SharingSearchResponse>(
        engine,
        'sharing/search',
        { key },
        signal
    )
    return [
        ...(response.users ?? []).map((u) => ({
            id: u.id,
            name: nameOf(u),
            type: 'User' as const,
        })),
        ...(response.userGroups ?? []).map((g) => ({
            id: g.id,
            name: nameOf(g),
            type: 'Group' as const,
        })),
    ]
}
