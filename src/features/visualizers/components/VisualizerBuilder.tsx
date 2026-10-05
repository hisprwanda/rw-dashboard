import i18n from '@dhis2/d2-i18n'
import { Button, IconSync16, NoticeBox, Tab, TabBar } from '@dhis2/ui'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { analyticsToCsv } from '@/features/analytics'
import { DataItemsModal } from '@/features/data-items'
import { ChartRenderer } from '@/features/charts'
import { OrgUnitModal } from '@/features/org-units'
import { PeriodModal } from '@/features/periods'
import { EmptyState, ErrorState, ExportModal, LoadingState } from '@/shared/components'
import { downloadText, fileNameOf } from '@/shared/utils/download'
import type { Visualization } from '../types/visualization.types'
import { useVisualBuilder } from '../hooks/useVisualBuilder'
import { visualizerActions } from '../store/visualizerSlice'
import { buildVisualization, visTypeFromChartType } from '../utils/visualization'
import { withOptions } from '../utils/visualizerOptions'
import { ChartTypePicker } from './ChartTypePicker'
import { DhisChart } from './DhisChart'
import { DimensionsPanel, type DimensionModal } from './DimensionsPanel'
import { FileMenu } from './FileMenu'
import { LayoutEditor } from './LayoutEditor'
import { OptionsModal } from './OptionsModal'
import { SaveVisualModal } from './SaveVisualModal'
import { SettingsPanel } from './SettingsPanel'
import { TitlesModal } from './TitlesModal'

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
    const { analytics } = builder
    const [tab, setTab] = useState<'dimensions' | 'settings'>('dimensions')
    const [modal, setModal] = useState<Modal | null>(null)
    const chartRef = useRef<HTMLDivElement>(null)
    const chartType = useAppSelector((state) => state.visualizer.chartType)
    const titles = useAppSelector((state) => state.visualizer.titles)
    const settings = useAppSelector((state) => state.visualizer.settings)
    const options = useAppSelector((state) => state.visualizer.options)
    const layout = useAppSelector((state) => state.selection.layout)
    const dataSource = useAppSelector((state) => state.selection.dataSource)

    const visType = visTypeFromChartType(chartType)
    const params = analytics.request?.dataParams
    // Titles stay empty unless set, so the DHIS2 charts generate their own.
    const visualization = useMemo(
        () =>
            visType &&
            visType !== 'PIVOT_TABLE' &&
            ({
                ...withOptions(buildVisualization(visType, layout, params), options),
                title: titles.visualTitle || undefined,
                subtitle: titles.customSubTitle || undefined,
            } satisfies Visualization),
        [visType, layout, params, options, titles.visualTitle, titles.customSubTitle]
    )

    if (builder.error) return <ErrorState error={builder.error} />
    if (builder.isLoading) return <LoadingState />

    const close = () => setModal(null)

    const data = analytics.data
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
        if (analytics.isFetching) return <LoadingState label={i18n.t('Running analytics')} />
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
        if (visualization) return <DhisChart data={analytics.data} visualization={visualization} />
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
                        loading={analytics.isFetching}
                        onClick={() => void builder.runAnalytics()}
                    >
                        {i18n.t('Update')}
                    </Button>
                    <ChartTypePicker
                        value={chartType}
                        onChange={(type) => dispatch(visualizerActions.setChartType(type))}
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
                                'The data source of this visualization was deleted or is not shared with you. Pick another data source.'
                            )}
                        </NoticeBox>
                    </div>
                )}
                <div ref={chartRef} className="min-h-[420px] p-2">
                    {renderChart()}
                </div>
            </main>

            {modal === 'data' && (
                <DataItemsModal
                    onClose={close}
                    onUpdate={builder.runAnalytics}
                    updating={analytics.isFetching}
                />
            )}
            {modal === 'period' && (
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
                    query={analytics.request?.storedQuery}
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
