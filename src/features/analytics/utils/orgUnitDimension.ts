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

const USER_KEYWORDS = {
    USER_ORGUNIT: 'is_USER_ORGUNIT',
    USER_ORGUNIT_CHILDREN: 'is_USER_ORGUNIT_CHILDREN',
    USER_ORGUNIT_GRANDCHILDREN: 'is_USER_ORGUNIT_GRANDCHILDREN',
} as const

/**
 * The inverse of `buildOrgUnitDimension`: restores the org-unit selection from a saved
 * `ou:` dimension/filter (e.g. `ou:abc;LEVEL-2;OU_GROUP-g` or `ou:USER_ORGUNIT`).
 */
export const parseOrgUnitDimension = (value: unknown): OrgUnitRequestInput => {
    const items =
        typeof value === 'string'
            ? value
                  .replace(/^ou:/, '')
                  .split(/[;,]/)
                  .map((item) => item.trim())
                  .filter(Boolean)
            : []
    const scope = {
        is_USER_ORGUNIT: false,
        is_USER_ORGUNIT_CHILDREN: false,
        is_USER_ORGUNIT_GRANDCHILDREN: false,
    }
    const orgUnitIds: string[] = []
    const levelIds: string[] = []
    const groupIds: string[] = []
    for (const item of items) {
        if (item in USER_KEYWORDS) scope[USER_KEYWORDS[item as keyof typeof USER_KEYWORDS]] = true
        else if (item.startsWith('LEVEL-')) levelIds.push(item.slice('LEVEL-'.length))
        else if (item.startsWith('OU_GROUP-')) groupIds.push(item.slice('OU_GROUP-'.length))
        else orgUnitIds.push(item)
    }
    return {
        useCurrentUserOrgUnits: Object.values(scope).some(Boolean),
        userOrgUnitScope: scope,
        orgUnitIds,
        levelIds,
        groupIds,
    }
}
