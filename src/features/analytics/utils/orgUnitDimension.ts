import type { OrgUnitRequestInput } from '../types/analytics.types'

/**
 * Builds the `ou:` dimension from the org-unit selection:
 * - the user's org units (`USER_ORGUNIT`, `…_CHILDREN`, `…_GRANDCHILDREN`), or
 * - explicit units, `LEVEL-x` and `OU_GROUP-x` items.
 * Empty parts are dropped, so an empty selection yields `ou:` (rejected by validation).
 */
export const buildOrgUnitDimension = ({
    useCurrentUserOrgUnits,
    userOrgUnitScope,
    orgUnitIds,
    levelIds,
    groupIds,
}: OrgUnitRequestInput): string => {
    const items = useCurrentUserOrgUnits
        ? [
              userOrgUnitScope.is_USER_ORGUNIT && 'USER_ORGUNIT',
              userOrgUnitScope.is_USER_ORGUNIT_CHILDREN && 'USER_ORGUNIT_CHILDREN',
              userOrgUnitScope.is_USER_ORGUNIT_GRANDCHILDREN && 'USER_ORGUNIT_GRANDCHILDREN',
          ]
        : [
              ...orgUnitIds,
              ...levelIds.map((level) => `LEVEL-${level}`),
              ...groupIds.map((group) => `OU_GROUP-${group}`),
          ]
    return `ou:${items.filter(Boolean).join(';')}`
}
