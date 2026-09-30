import type { OrgUnitSelectionState } from '@/features/org-units'
import type { SelectionState } from '../store/selectionSlice'
import { buildAnalyticsRequest, type AnalyticsRequest } from './buildAnalyticsRequest'
import { formatAnalyticsDimensions } from './dimensions'

/**
 * The analytics request of a chart builder, from its Redux selection and org-unit
 * selection. `null` while data, period or org unit is missing.
 */
export const buildSelectionRequest = (
    selection: Pick<SelectionState, 'dimensions' | 'layout'>,
    orgUnits: OrgUnitSelectionState
): AnalyticsRequest | null =>
    buildAnalyticsRequest({
        dimension: formatAnalyticsDimensions(selection.dimensions),
        layout: selection.layout,
        orgUnit: {
            useCurrentUserOrgUnits: orgUnits.useCurrentUserOrgUnits,
            userOrgUnitScope: orgUnits.userOrgUnitScope,
            orgUnitIds: orgUnits.selectedOrgUnitIds,
            levelIds: orgUnits.selectedLevelIds,
            groupIds: orgUnits.selectedGroupIds,
        },
    })
