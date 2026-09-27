/**
 * Legacy helpers that restore the org-unit selection of a saved visual/map from its
 * `ou:` filter. All delegate to `parseOrgUnitDimension` (tested round-trip with
 * `buildOrgUnitDimension`). @deprecated call `parseOrgUnitDimension` directly.
 */
import { parseOrgUnitDimension } from '@/features/analytics'
import type { UserOrgUnitScope } from '@/features/org-units'

export const formatCurrentUserSelectedOrgUnit = (filter: unknown): UserOrgUnitScope =>
    parseOrgUnitDimension(filter).userOrgUnitScope

/** Explicitly picked org-unit ids only (not levels, groups or user keywords). */
export const formatSelectedOrganizationUnit = (filter: unknown): string[] => [
    ...parseOrgUnitDimension(filter).orgUnitIds,
]

export const formatOrgUnitGroup = (filter: unknown): string[] => [
    ...parseOrgUnitDimension(filter).groupIds,
]

export const formatOrgUnitLevels = (filter: unknown): string[] =>
    parseOrgUnitDimension(filter).levelIds.map(String)
