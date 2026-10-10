import i18n from '@dhis2/d2-i18n'
import { Button, IconSync16, NoticeBox, Tab, TabBar } from '@dhis2/ui'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useAppDispatch, useAppSelector } from '@/app/store'
import {
    analyticsToCsv,
    mergeAnalyticsResponses,
    multiSourceIssues,
    selectionActions,
    useChartLegendSets,
} from '@/features/analytics'
import { DATA_ITEM_TYPES, DataItemsModal } from '@/features/data-items'
import { ChartRenderer } from '@/features/charts'
import { OrgUnitModal } from '@/features/org-units'
import { PeriodModal } from '@/features/periods'
import { EmptyState, ErrorState, ExportModal, LoadingState } from '@/shared/components'
import { downloadText, fileNameOf } from '@/shared/utils/download'
import type { VisType, Visualization } from '../types/visualization.types'
import { useVisualBuilder } from '../hooks/useVisualBuilder'
import { visualizerActions } from '../store/visualizerSlice'
import { buildVisualization, visTypeFromChartType } from '../utils/visualization'
import { adaptLayoutToVisType } from '../utils/layoutRules'
import { withOptions } from '../utils/visualizerOptions'
import { isYearOverYearChart, yearOverYearLayout } from '../utils/yearOverYear'
import { AdditionalSourceModal } from './AdditionalSourceModal'
import { ChartTypePicker } from './ChartTypePicker'
import { DhisChart } from './DhisChart'
import { DhisPivotTable } from './DhisPivotTable'
import { DynamicDimensionModal } from './DynamicDimensionModal'
import { DimensionsPanel, type DimensionModal } from './DimensionsPanel'
import { FileMenu } from './FileMenu'
import { LayoutEditor } from './LayoutEditor'
import { OptionsModal } from './OptionsModal'
import { OutlierError, OutlierTable } from './OutlierTable'
import { SaveVisualModal } from './SaveVisualModal'
import { SettingsPanel } from './SettingsPanel'
import { TitlesModal } from './TitlesModal'
import { YearOverYearPeriodModal } from './YearOverYearPeriodModal'

/** Types drawn by the DHIS2 chart engine from one analytics response. */
const isHighchartsType = (type: VisType) =>
    !['PIVOT_TABLE', 'OUTLIER_TABLE', 'YEAR_OVER_YEAR_LINE', 'YEAR_OVER_YEAR_COLUMN'].includes(type)

const hasEditableLayout = (type: VisType) =>
    !['OUTLIER_TABLE', 'YEAR_OVER_YEAR_LINE', 'YEAR_OVER_YEAR_COLUMN'].includes(type)

type Modal = DimensionModal | 'titles' | 'options' | 'save' | 'export'

interface VisualizerBuilderProps {
    /** Key of the saved visual to edit; omitted to build a new one. */
    visualId?: string
}

/** Builds, previews, saves and exports one visualization. */
export const VisualizerBuilder = ({ visualId }: VisualizerBuilderProps) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const builder = useVisualBuilder(visualId)
    const { analytics, yearOverYear, outliers } = builder
    const [tab, setTab] = useState<'dimensions' | 'settings'>('dimensions')
    const [modal, setModal] = useState<Modal | null>(null)
    const chartRef = useRef<HTMLDivElement>(null)
    const chartType = useAppSelector((state) => state.visualizer.chartType)
    const titles = useAppSelector((state) => state.visualizer.titles)
    const settings = useAppSelector((state) => state.visualizer.settings)
    const options = useAppSelector((state) => state.visualizer.options)
    const layout = useAppSelector((state) => state.selection.layout)
    const dataSource = useAppSelector((state) => state.selection.dataSource)
    const selection = useAppSelector((state) => state.selection)
    const issues = useMemo(() => multiSourceIssues(selection), [selection])
    const hasAdditionalData = selection.additionalSources.some(({ items }) => items.length)
    const usesUserOrgUnits = useAppSelector(
        (state) => state.orgUnitSelection.useCurrentUserOrgUnits
    )

    const legendSets = useChartLegendSets(dataSource)
    const legendSet = legendSets.data?.find(({ id }) => id === options.legendSetId)
    const visType = visTypeFromChartType(chartType)
    const isYearOverYear = isYearOverYearChart(chartType)
    const isOutlier = chartType === 'Outlier Table'
    const request = isOutlier
        ? outliers.request
        : isYearOverYear
          ? yearOverYear.request
          : analytics.request
    const params = request?.dataParams
    const visualLayout = isYearOverYear ? yearOverYearLayout(layout) : layout
    const isFetching = analytics.isFetching || yearOverYear.isFetching || outliers.isFetching
    const singleSourceOnly = isYearOverYear || isOutlier
    // Titles stay empty unless set, so the DHIS2 charts generate their own.
    const visualization = useMemo(
        () =>
            visType &&
            ({
                ...withOptions(buildVisualization(visType, visualLayout, params), options),
                title: titles.visualTitle || undefined,
                subtitle: titles.customSubTitle || undefined,
            } satisfies Visualization),
        [visType, visualLayout, params, options, titles.visualTitle, titles.customSubTitle]
    )

    if (builder.error) return <ErrorState error={builder.error} />
    if (builder.isLoading) return <LoadingState />

    const close = () => setModal(null)

    const data = isOutlier
        ? undefined
        : isYearOverYear
          ? yearOverYear.data && mergeAnalyticsResponses(yearOverYear.data)
          : analytics.data
    const downloadData = data
        ? () =>
              downloadText(
                  `${fileNameOf(builder.saved?.visualName ?? titles.visualTitle ?? '', 'visualization')}.csv`,
                  // The BOM makes Excel read the file as UTF-8.
                  `\ufeff${analyticsToCsv(data)}`,
                  'text/csv;charset=utf-8'
              )
        : null

    const renderChart = () => {
        if (isFetching) return <LoadingState label={i18n.t('Running analytics')} />
        if (isOutlier) {
            if (outliers.error) return <OutlierError error={outliers.error} />
            if (!outliers.data) {
                return (
                    <EmptyState
                        message={i18n.t(
                            'Select data elements, period and organisation unit, then click Update.'
                        )}
                    />
                )
            }
            return <OutlierTable data={outliers.data} />
        }
        if (isYearOverYear) {
            if (yearOverYear.error) return <ErrorState error={yearOverYear.error} />
            if (!yearOverYear.data || !visualization) {
                return (
                    <EmptyState
                        message={i18n.t(
                            'Select data, years and organisation unit, then click Update.'
                        )}
                    />
                )
            }
            return (
                <DhisChart
                    data={yearOverYear.data}
                    visualization={visualization}
                    extraOptions={yearOverYear.extraOptions}
                />
            )
        }
        if (analytics.error) return <ErrorState error={analytics.error} />
        if (!analytics.data) {
            return (
                <EmptyState
                    message={i18n.t(
                        'Select data, period and organisation unit, then click Update.'
                    )}
                />
            )
        }
        if (visualization?.type === 'PIVOT_TABLE')
            return (
                <DhisPivotTable
                    data={analytics.data}
                    visualization={visualization}
                    legendSets={legendSet ? [legendSet] : undefined}
                />
            )
        if (visualization && isHighchartsType(visualization.type))
            return (
                <DhisChart
                    data={analytics.data}
                    visualization={visualization}
                    legendSets={legendSet ? [legendSet] : undefined}
                />
            )
        return (
            <ChartRenderer
                type={chartType}
                data={analytics.data}
                visualTitleAndSubTitle={titles}
                visualSettings={settings}
                metaDataLabels={analytics.metaData}
                analyticsPayloadDeterminer={layout}
            />
        )
    }

    return (
        <div className="flex items-start gap-3 p-2">
            <aside className="w-1/4 min-w-[260px] rounded bg-white p-3 shadow">
                <TabBar fixed>
                    <Tab selected={tab === 'dimensions'} onClick={() => setTab('dimensions')}>
                        {i18n.t('Dimensions')}
                    </Tab>
                    <Tab selected={tab === 'settings'} onClick={() => setTab('settings')}>
                        {i18n.t('Settings')}
                    </Tab>
                </TabBar>
                <div className="pt-3">
                    {tab === 'dimensions' ? (
                        <DimensionsPanel onOpen={setModal} onDataSourceChange={analytics.reset} />
                    ) : (
                        <SettingsPanel onEditTitles={() => setModal('titles')} />
                    )}
                </div>
            </aside>

            <main className="flex-grow rounded bg-white shadow">
                <div className="flex items-center gap-2 border-b border-gray-200 p-2">
                    <Button
                        small
                        primary
                        icon={<IconSync16 />}
                        loading={isFetching}
                        onClick={() => void builder.runAnalytics()}
                    >
                        {i18n.t('Update')}
                    </Button>
                    <ChartTypePicker
                        value={chartType}
                        onChange={(type) => {
                            dispatch(visualizerActions.setChartType(type))
                            // Outliers are detected in data element values only.
                            const dataElements = DATA_ITEM_TYPES.find(
                                (option) => option.value === 'dataElements'
                            )
                            if (type === 'Outlier Table' && dataElements) {
                                dispatch(selectionActions.setDimensionItemType(dataElements))
                            }
                            // Each chart type allows its own layout (the official rules).
                            // Year-over-year and outlier tables have fixed layouts, derived
                            // when drawing: the stored one is kept for the other types.
                            const next = visTypeFromChartType(type)
                            if (next && hasEditableLayout(next)) {
                                dispatch(
                                    selectionActions.setLayout(adaptLayoutToVisType(layout, next))
                                )
                            }
                        }}
                    />
                    {visualization && (
                        <Button small onClick={() => setModal('options')}>
                            {i18n.t('Options')}
                        </Button>
                    )}
                    <FileMenu
                        isSaved={!!visualId}
                        onSave={() => setModal('save')}
                        onExport={() => setModal('export')}
                        onDownloadData={downloadData}
                    />
                </div>
                <LayoutEditor />
                {builder.missingDataSource && (
                    <div className="p-2">
                        <NoticeBox warning title={i18n.t('Data source not available')}>
                            {i18n.t(
                                'A data source of this visualization was deleted or is not shared with you. Pick another data source.'
                            )}
                        </NoticeBox>
                    </div>
                )}
                {singleSourceOnly && hasAdditionalData && (
                    <div className="p-2">
                        <NoticeBox warning title={i18n.t('Data from other sources')}>
                            {i18n.t(
                                'This chart type reads one data source only. Remove the other data sources to run it.'
                            )}
                        </NoticeBox>
                    </div>
                )}
                {!singleSourceOnly && issues.length > 0 && (
                    <div className="p-2">
                        <NoticeBox warning title={i18n.t('Data from other sources')}>
                            {issues.includes('dataInFilter') && (
                                <p>
                                    {i18n.t(
                                        'Move Data to the columns or rows. Values of different data sources cannot be added up in a filter.'
                                    )}
                                </p>
                            )}
                            {issues.includes('dynamicDimensions') && (
                                <p>
                                    {i18n.t(
                                        'Remove the other dimensions (categories, group sets…). They only exist on the main data source.'
                                    )}
                                </p>
                            )}
                        </NoticeBox>
                    </div>
                )}
                {hasAdditionalData && usesUserOrgUnits && (
                    <div className="p-2">
                        <NoticeBox title={i18n.t('User organisation units')}>
                            {i18n.t(
                                'On other data sources, user organisation units are those of the account behind the access token. Pick organisation units to compare the same places.'
                            )}
                        </NoticeBox>
                    </div>
                )}
                {analytics.sourceErrors.length > 0 && (
                    <div className="p-2">
                        <NoticeBox warning title={i18n.t('Some data could not be loaded')}>
                            {analytics.sourceErrors.map(({ instanceName, error }) => (
                                <p key={instanceName}>
                                    {instanceName}: {error.message}
                                </p>
                            ))}
                        </NoticeBox>
                    </div>
                )}
                <div ref={chartRef} className="min-h-[420px] p-2">
                    {renderChart()}
                </div>
            </main>

            {modal === 'data' && (
                <DataItemsModal
                    notice={
                        isOutlier ? i18n.t('The outlier table only uses data elements.') : undefined
                    }
                    onClose={close}
                    onUpdate={builder.runAnalytics}
                    updating={analytics.isFetching}
                />
            )}
            {modal === 'period' && isYearOverYear && (
                <YearOverYearPeriodModal
                    onClose={close}
                    onUpdate={builder.runAnalytics}
                    updating={isFetching}
                />
            )}
            {modal === 'period' && !isYearOverYear && (
                <PeriodModal
                    onClose={close}
                    onUpdate={builder.runAnalytics}
                    updating={analytics.isFetching}
                />
            )}
            {modal === 'orgUnit' && (
                <OrgUnitModal
                    instance={dataSource}
                    onClose={close}
                    onUpdate={builder.runAnalytics}
                    updating={analytics.isFetching}
                />
            )}
            {modal?.startsWith('dynamic:') && (
                <DynamicDimensionModal
                    dimensionId={modal.slice('dynamic:'.length)}
                    onClose={close}
                    onUpdate={builder.runAnalytics}
                    updating={analytics.isFetching}
                />
            )}
            {modal?.startsWith('source:') && (
                <AdditionalSourceModal
                    dataSourceId={modal.slice('source:'.length)}
                    onClose={close}
                    onUpdate={builder.runAnalytics}
                    updating={analytics.isFetching}
                />
            )}
            {modal === 'titles' && <TitlesModal onClose={close} />}
            {modal === 'options' && <OptionsModal onClose={close} />}
            {modal === 'export' && (
                <ExportModal
                    targetRef={chartRef}
                    defaultFileName={builder.saved?.visualName ?? titles.visualTitle ?? ''}
                    onClose={close}
                />
            )}
            {modal === 'save' && (
                <SaveVisualModal
                    visualId={visualId}
                    saved={builder.saved}
                    query={request?.storedQuery}
                    onClose={close}
                    onSaved={(key) => {
                        close()
                        if (!visualId) {
                            builder.adopt(key)
                            navigate(paths.visualizer(key), { replace: true })
                        }
                    }}
                />
            )}
        </div>
    )
}
