import type { IdentifiableObject, OrgUnit, OrgUnitLevel } from '@/shared/types/dhis2.types'

export interface OrgUnitGroupWithMembers extends IdentifiableObject {
    organisationUnits: IdentifiableObject[]
}

/**
 * Everything the org-unit pickers need for one instance.
 * The nested `{ organisationUnits: [...] }` wrappers mirror the raw API responses
 * (and the legacy `currentUserInfoAndOrgUnitsData` shape still read by old components).
 */
export interface OrgUnitMetadata {
    currentUser: { organisationUnits: IdentifiableObject[] }
    orgUnits: { organisationUnits: OrgUnit[] }
    orgUnitLevels: { organisationUnitLevels: OrgUnitLevel[] }
    orgUnitGroups: { organisationUnitGroups: OrgUnitGroupWithMembers[] }
}

/** Relative "user org unit" keywords of the analytics API, toggled independently. */
export interface UserOrgUnitScope {
    is_USER_ORGUNIT: boolean
    is_USER_ORGUNIT_CHILDREN: boolean
    is_USER_ORGUNIT_GRANDCHILDREN: boolean
}
