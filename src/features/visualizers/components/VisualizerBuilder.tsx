import i18n from '@dhis2/d2-i18n'
import { Button, IconSync16, NoticeBox, Tab, TabBar } from '@dhis2/ui'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { DataItemsModal } from '@/features/data-items'
import { ChartRenderer } from '@/features/charts'
import { OrgUnitModal } from '@/features/org-units'
import { PeriodModal } from '@/features/periods'
import { EmptyState, ErrorState, ExportModal, LoadingState } from '@/shared/components'
import { useVisualBuilder } from '../hooks/useVisualBuilder'
import { visualizerActions } from '../store/visualizerSlice'
import { ChartTypePicker } from './ChartTypePicker'
import { DimensionsPanel, type DimensionModal } from './DimensionsPanel'
import { FileMenu } from './FileMenu'
import { LayoutEditor } from './LayoutEditor'
import { SaveVisualModal } from './SaveVisualModal'
import { SettingsPanel } from './SettingsPanel'
import { TitlesModal } from './TitlesModal'

type Modal = DimensionModal | 'titles' | 'save' | 'export'

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
    const layout = useAppSelector((state) => state.selection.layout)
    const dataSource = useAppSelector((state) => state.selection.dataSource)

    if (builder.error) return <ErrorState error={builder.error} />
    if (builder.isLoading) return <LoadingState />

    const close = () => setModal(null)

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
                    <FileMenu
                        isSaved={!!visualId}
                        onSave={() => setModal('save')}
                        onExport={() => setModal('export')}
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
