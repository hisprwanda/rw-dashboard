import i18n from '@dhis2/d2-i18n'
import {
    IconClock16,
    IconDimensionCategoryOptionGroupset16,
    IconDimensionData16,
    IconDimensionOrgUnit16,
} from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectionActions, useDimensions } from '@/features/analytics'
import { DataSourceSelect } from '@/features/data-sources'
import { orgUnitSelectionActions } from '@/features/org-units'
import { visualizerActions } from '../store/visualizerSlice'
import { DimensionRow, PanelHeading } from './DimensionRow'
import { AdditionalSourcesSection } from './AdditionalSourcesSection'

export type DimensionModal =
    | 'data'
    | 'period'
    | 'orgUnit'
    | `dynamic:${string}`
    | `source:${string}`

interface DimensionsPanelProps {
    onOpen: (modal: DimensionModal) => void
    /** Called after the data source changed (the previous result no longer applies). */
    onDataSourceChange: () => void
}

/** Data source plus the three dimension buttons of the builder. */
export const DimensionsPanel = ({ onOpen, onDataSourceChange }: DimensionsPanelProps) => {
    const dispatch = useAppDispatch()
    const dataSourceId = useAppSelector((state) => state.selection.dataSourceId)
    const currentSource = useAppSelector((state) => state.selection.dataSource)
    const selectedDimensions = useAppSelector((state) => state.selection.dimensions)
    const dynamicDimensions = useDimensions(currentSource)
    const dataCount = useAppSelector((state) => state.selection.dimensions.dx?.length ?? 0)
    const periodCount = useAppSelector((state) => state.selection.dimensions.pe?.length ?? 0)
    const orgUnits = useAppSelector((state) => state.orgUnitSelection)
    const orgUnitCount = orgUnits.useCurrentUserOrgUnits
        ? Object.values(orgUnits.userOrgUnitScope).filter(Boolean).length
        : orgUnits.selectedOrgUnitIds.length +
          orgUnits.selectedLevelIds.length +
          orgUnits.selectedGroupIds.length

    return (
        <div className="flex flex-col gap-2">
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
            <div className="flex flex-col">
                <PanelHeading>{i18n.t('Main dimensions')}</PanelHeading>
                <DimensionRow
                    icon={<IconDimensionData16 />}
                    label={i18n.t('Data')}
                    count={dataCount}
                    onClick={() => onOpen('data')}
                />
                <DimensionRow
                    icon={<IconClock16 />}
                    label={i18n.t('Period')}
                    count={periodCount}
                    onClick={() => onOpen('period')}
                />
                <DimensionRow
                    icon={<IconDimensionOrgUnit16 />}
                    label={i18n.t('Organisation unit')}
                    count={orgUnitCount}
                    onClick={() => onOpen('orgUnit')}
                />
            </div>
            {!!dynamicDimensions.data?.length && (
                <div className="flex flex-col">
                    <PanelHeading>{i18n.t('Other dimensions')}</PanelHeading>
                    <div className="flex max-h-[240px] flex-col overflow-y-auto">
                        {dynamicDimensions.data.map(({ id, displayName }) => (
                            <DimensionRow
                                key={id}
                                icon={<IconDimensionCategoryOptionGroupset16 />}
                                label={displayName}
                                count={selectedDimensions[id]?.length ?? 0}
                                onClick={() => onOpen(`dynamic:${id}`)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <AdditionalSourcesSection
                onOpen={(id) => onOpen(`source:${id}`)}
                onRemove={onDataSourceChange}
            />
        </div>
    )
}
