import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppStore } from '@/app/store'
import {
    buildSelectionRuns,
    getDimensionItems,
    multiSourceIssues,
    selectionActions,
    transformMetadataLabels,
    useCombinedAnalyticsRun,
    type AdditionalSource,
    type SelectedDataSource,
    type SelectionState,
} from '@/features/analytics'
import { useDisplayProperty } from '@/features/auth'
import { CURRENT_INSTANCE_ID, useDataSources } from '@/features/data-sources'
import { orgUnitSelectionActions, type OrgUnitSelectionState } from '@/features/org-units'
import { useApplicationTitle } from '@/features/system'
import { visualizerActions, type VisualizerState } from '../store/visualizerSlice'
import { buildYearOverYearRun, isYearOverYearChart } from '../utils/yearOverYear'
import { useYearOverYearRun } from './useYearOverYearRun'
import { visualToBuilderState } from '../utils/visualState'
import { useVisual } from './useVisual'

const NEW_VISUAL = 'new'

/**
 * Everything the visualizer builder needs: loads a saved visual into the Redux slices
 * (or resets them for a new one), runs analytics on demand and keeps the automatic
 * subtitle in sync with the last result.
 */
export const useVisualBuilder = (visualId: string | undefined) => {
    const dispatch = useAppDispatch()
    const store = useAppStore()
    const applicationTitle = useApplicationTitle()
    const displayProperty = useDisplayProperty()
    const analytics = useCombinedAnalyticsRun()
    const yearOverYear = useYearOverYearRun()
    const { run, reset } = analytics
    const { run: runYearOverYear, reset: resetYearOverYear } = yearOverYear
    const visual = useVisual(visualId)
    const dataSources = useDataSources()
    /** The visual whose state is in the store; the store is (re)initialised once per visual. */
    const [loadedId, setLoadedId] = useState<string | null>(null)
    const [missingDataSource, setMissingDataSource] = useState(false)

    /**
     * Runs the analytics of a selection the way its chart type needs them (no-op while it
     * is incomplete). Selections that cannot be run are explained in the builder.
     */
    const start = useCallback(
        async (
            selection: SelectionState,
            orgUnits: OrgUnitSelectionState,
            visualizer: VisualizerState
        ) => {
            if (isYearOverYearChart(visualizer.chartType)) {
                reset()
                if (selection.additionalSources.some(({ items }) => items.length)) return
                const next = buildYearOverYearRun(
                    selection,
                    orgUnits,
                    displayProperty,
                    visualizer.yearOverYear
                )
                if (next) await runYearOverYear(next, selection.dataSource)
                return
            }
            resetYearOverYear()
            if (multiSourceIssues(selection).length) return
            const runs = buildSelectionRuns(selection, orgUnits, displayProperty)
            if (runs) await run(runs)
        },
        [displayProperty, run, reset, runYearOverYear, resetYearOverYear]
    )

    /** Runs the analytics of the current selection. */
    const runAnalytics = useCallback(async () => {
        const { selection, orgUnitSelection, visualizer } = store.getState()
        await start(selection, orgUnitSelection, visualizer)
    }, [store, start])

    useEffect(() => {
        const target = visualId ?? NEW_VISUAL
        if (loadedId === target) return

        if (!visualId) {
            dispatch(
                selectionActions.changeDataSource({
                    id: CURRENT_INSTANCE_ID,
                    dataSource: { isCurrentInstance: true, instanceName: applicationTitle },
                })
            )
            dispatch(orgUnitSelectionActions.resetOrgUnitSelection())
            dispatch(visualizerActions.resetVisualizer())
            reset()
            resetYearOverYear()
            setMissingDataSource(false)
            setLoadedId(target)
            return
        }

        if (!visual.data || !dataSources.data) return
        const saved = visual.data
        const currentInstance = { isCurrentInstance: true, instanceName: applicationTitle }
        const resolve = (id: string | undefined): SelectedDataSource | undefined =>
            !id || id === CURRENT_INSTANCE_ID
                ? currentInstance
                : dataSources.data?.find((entry) => entry.key === id)?.value
        const dataSource = resolve(saved.dataSourceId)
        const additional = (saved.additionalSources ?? []).map(({ dataSourceId, dataItems }) => ({
            dataSourceId,
            dataSource: resolve(dataSourceId),
            items: dataItems,
        }))
        const available = additional.filter(
            (source): source is AdditionalSource => !!source.dataSource
        )
        const missing = !dataSource || available.length < additional.length

        // A deleted (or unshared) data source: show the visual's settings, but do not run.
        const state = visualToBuilderState(saved, dataSource ?? currentInstance, available)
        dispatch(selectionActions.setSelection(state.selection))
        dispatch(orgUnitSelectionActions.setOrgUnitSelection(state.orgUnits))
        dispatch(visualizerActions.setVisualizer(state.visualizer))
        setMissingDataSource(missing)
        setLoadedId(target)

        reset()
        resetYearOverYear()
        if (!missing) void start(state.selection, state.orgUnits, state.visualizer)
    }, [
        visualId,
        visual.data,
        dataSources.data,
        loadedId,
        applicationTitle,
        dispatch,
        start,
        reset,
        resetYearOverYear,
    ])

    // The automatic subtitle lists the items of the last result.
    useEffect(() => {
        if (!analytics.metaData) return
        const labels = transformMetadataLabels(analytics.metaData)
        dispatch(
            visualizerActions.setDefaultSubTitle({
                periods: getDimensionItems(labels, 'periods'),
                orgUnits: getDimensionItems(labels, 'orgUnits'),
                dataElements: getDimensionItems(labels, 'dataElements'),
            })
        )
    }, [analytics.metaData, dispatch])

    /** After saving a new visual: its URL changes but the store already holds it. */
    const adopt = useCallback((id: string) => setLoadedId(id), [])

    return {
        analytics,
        yearOverYear,
        runAnalytics,
        adopt,
        saved: visual.data,
        isLoading:
            visual.isLoading || dataSources.isLoading || loadedId !== (visualId ?? NEW_VISUAL),
        error: visual.error ?? dataSources.error,
        missingDataSource,
    }
}
