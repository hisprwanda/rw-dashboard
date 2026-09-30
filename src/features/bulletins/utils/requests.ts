import { buildOrgUnitDimension, type AnalyticsParams } from '@/features/analytics'
import type { QueryParams } from '@/shared/api'
import type { BulletinOrgUnits } from '../types/bulletin.types'

/** The bulletin's org units as an analytics `ou:` dimension (levels and groups included). */
export const orgUnitDimension = (orgUnits: BulletinOrgUnits, extraLevel?: number) =>
    buildOrgUnitDimension({
        useCurrentUserOrgUnits: orgUnits.useCurrentUserOrgUnits,
        userOrgUnitScope: orgUnits.userOrgUnitScope,
        orgUnitIds: orgUnits.orgUnits.map((unit) => unit.id),
        levelIds: extraLevel ? [String(extraLevel)] : orgUnits.levelIds,
        groupIds: extraLevel ? [] : orgUnits.groupIds,
    })

/** Trend of data items over periods (data on columns, periods on rows, org units filter). */
export const trendParams = (
    dataItemIds: readonly string[],
    periodIds: readonly string[],
    orgUnits: BulletinOrgUnits,
    displayProperty: 'NAME' | 'SHORTNAME' = 'NAME'
): AnalyticsParams => ({
    dimension: [`dx:${dataItemIds.join(';')}`, `pe:${periodIds.join(';')}`],
    filter: orgUnitDimension(orgUnits),
    displayProperty,
    includeNumDen: false,
})

/**
 * Reporting rates of data sets per org unit (at `level`, under the bulletin org units)
 * and period.
 */
export const completenessParams = (
    dataSetIds: readonly string[],
    periodIds: readonly string[],
    orgUnits: BulletinOrgUnits,
    level: number,
    displayProperty: 'NAME' | 'SHORTNAME' = 'NAME'
): AnalyticsParams => ({
    dimension: [
        `dx:${dataSetIds.map((id) => `${id}.REPORTING_RATE`).join(';')}`,
        `pe:${periodIds.join(';')}`,
        orgUnitDimension(orgUnits, level),
    ],
    displayProperty,
})

/**
 * Org-unit scope of tracker queries. Tracker has no levels or groups: explicit units are
 * searched with their descendants, user org units with the user's capture scope.
 */
export const trackerOrgUnitParams = (orgUnits: BulletinOrgUnits): QueryParams =>
    orgUnits.useCurrentUserOrgUnits || !orgUnits.orgUnits.length
        ? { ouMode: 'CAPTURE' }
        : { orgUnit: orgUnits.orgUnits.map((unit) => unit.id).join(';'), ouMode: 'DESCENDANTS' }
