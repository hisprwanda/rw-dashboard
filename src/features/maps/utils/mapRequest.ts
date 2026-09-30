import {
    buildAnalyticsRequest,
    buildOrgUnitDimension,
    formatAnalyticsDimensions,
    type AnalyticsRequest,
    type DisplayProperty,
    type SelectionState,
} from '@/features/analytics'
import type { OrgUnitSelectionState } from '@/features/org-units'
import type { GeoFeaturesParams } from '../types/map.types'

export interface MapRequest {
    /** Org units as a dimension, periods on the filter. */
    analytics: AnalyticsRequest
    geoFeatures: GeoFeaturesParams
}

/** The thematic layer requests of the current selection; `null` while incomplete. */
export const buildMapRequest = (
    selection: Pick<SelectionState, 'dimensions'>,
    orgUnits: OrgUnitSelectionState,
    displayProperty: DisplayProperty = 'NAME'
): MapRequest | null => {
    const orgUnitDimension = buildOrgUnitDimension({
        useCurrentUserOrgUnits: orgUnits.useCurrentUserOrgUnits,
        userOrgUnitScope: orgUnits.userOrgUnitScope,
        orgUnitIds: orgUnits.selectedOrgUnitIds,
        levelIds: orgUnits.selectedLevelIds,
        groupIds: orgUnits.selectedGroupIds,
    })
    if (orgUnitDimension === 'ou:') return null
    const analytics = buildAnalyticsRequest({
        dimension: formatAnalyticsDimensions(selection.dimensions, true),
        map: {
            periodFilter: `pe:${(selection.dimensions.pe ?? []).join(';')}`,
            orgUnitDimension,
        },
        displayProperty,
    })
    if (!analytics) return null
    return { analytics, geoFeatures: { ou: orgUnitDimension, displayProperty } }
}
