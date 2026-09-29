import i18n from '@dhis2/d2-i18n'
import { Button, IconClock16, IconDimensionData16, IconDimensionOrgUnit16 } from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectionActions } from '@/features/analytics'
import { DataSourceSelect } from '@/features/data-sources'
import { orgUnitSelectionActions } from '@/features/org-units'
import { visualizerActions } from '../store/visualizerSlice'

export type DimensionModal = 'data' | 'period' | 'orgUnit'

interface DimensionsPanelProps {
    onOpen: (modal: DimensionModal) => void
    /** Called after the data source changed (the previous result no longer applies). */
    onDataSourceChange: () => void
}

const withCount = (label: string, count: number) => (count ? `${label} (${count})` : label)

/** Data source plus the three dimension buttons of the builder. */
export const DimensionsPanel = ({ onOpen, onDataSourceChange }: DimensionsPanelProps) => {
    const dispatch = useAppDispatch()
    const dataSourceId = useAppSelector((state) => state.selection.dataSourceId)
    const dataCount = useAppSelector((state) => state.selection.dimensions.dx?.length ?? 0)
    const periodCount = useAppSelector((state) => state.selection.dimensions.pe?.length ?? 0)
    const orgUnits = useAppSelector((state) => state.orgUnitSelection)
    const orgUnitCount = orgUnits.useCurrentUserOrgUnits
        ? Object.values(orgUnits.userOrgUnitScope).filter(Boolean).length
        : orgUnits.selectedOrgUnitIds.length +
          orgUnits.selectedLevelIds.length +
          orgUnits.selectedGroupIds.length

    return (
        <div className="flex flex-col gap-3">
            <DataSourceSelect
                value={dataSourceId}
                onChange={(id, dataSource) => {
                    // Items, org units and settings are specific to an instance.
                    dispatch(selectionActions.changeDataSource({ id, dataSource }))
                    dispatch(orgUnitSelectionActions.resetOrgUnitSelection())
                    dispatch(visualizerActions.resetVisualizer())
                    onDataSourceChange()
                }}
            />
            <span className="text-sm font-medium text-gray-700">{i18n.t('Main dimensions')}</span>
            <Button icon={<IconDimensionData16 />} onClick={() => onOpen('data')}>
                {withCount(i18n.t('Data'), dataCount)}
            </Button>
            <Button icon={<IconClock16 />} onClick={() => onOpen('period')}>
                {withCount(i18n.t('Period'), periodCount)}
            </Button>
            <Button icon={<IconDimensionOrgUnit16 />} onClick={() => onOpen('orgUnit')}>
                {withCount(i18n.t('Organisation unit'), orgUnitCount)}
            </Button>
        </div>
    )
}
