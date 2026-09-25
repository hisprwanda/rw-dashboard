import type { InstanceClient } from '@/shared/api'
import type { OrgUnit } from '@/shared/types/dhis2.types'
import type { OrgUnitMetadata } from '../types/orgUnit.types'

/** Current user's org units, the org-unit tree, levels and groups, fetched in parallel. */
export const fetchOrgUnitMetadata = async (
    client: InstanceClient,
    signal?: AbortSignal
): Promise<OrgUnitMetadata> => {
    const [currentUser, orgUnits, orgUnitLevels, orgUnitGroups] = await Promise.all([
        client.get<OrgUnitMetadata['currentUser']>(
            'me',
            { fields: 'organisationUnits[id,displayName]' },
            signal
        ),
        client.get<OrgUnitMetadata['orgUnits']>(
            'organisationUnits',
            {
                fields: 'id,displayName,path,level,children[id,displayName,path,level]',
                paging: false,
            },
            signal
        ),
        client.get<OrgUnitMetadata['orgUnitLevels']>(
            'organisationUnitLevels',
            { fields: 'id,displayName,level', paging: false },
            signal
        ),
        client.get<OrgUnitMetadata['orgUnitGroups']>(
            'organisationUnitGroups',
            { fields: 'id,displayName,organisationUnits[id,displayName]', paging: false },
            signal
        ),
    ])
    return { currentUser, orgUnits, orgUnitLevels, orgUnitGroups }
}

/** Direct children of an org unit (for lazily expanded trees). */
export const fetchOrgUnitChildren = async (
    client: InstanceClient,
    parentId: string,
    signal?: AbortSignal
): Promise<OrgUnit[]> => {
    const result = await client.get<{ children?: OrgUnit[] }>(
        `organisationUnits/${parentId}`,
        { fields: 'children[id,path,displayName]' },
        signal
    )
    return result.children ?? []
}

export const fetchOrgUnitName = async (
    client: InstanceClient,
    orgUnitId: string,
    signal?: AbortSignal
): Promise<string> => {
    const result = await client.get<{ displayName: string }>(
        `organisationUnits/${orgUnitId}`,
        { fields: 'displayName' },
        signal
    )
    return result.displayName
}
