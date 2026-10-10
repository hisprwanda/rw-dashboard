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
} from '@/features/analytics'
import { useDisplayProperty } from '@/features/auth'
import { CURRENT_INSTANCE_ID, useDataSources } from '@/features/data-sources'
import { orgUnitSelectionActions } from '@/features/org-units'
import { useApplicationTitle } from '@/features/system'
import { visualizerActions } from '../store/visualizerSlice'
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
    const { run, reset } = analytics
    const visual = useVisual(visualId)
    const dataSources = useDataSources()
    /** The visual whose state is in the store; the store is (re)initialised once per visual. */
    const [loadedId, setLoadedId] = useState<string | null>(null)
    const [missingDataSource, setMissingDataSource] = useState(false)

    /** Runs the analytics of the current selection (no-op while it is incomplete). */
    const runAnalytics = useCallback(async () => {
        const { selection, orgUnitSelection } = store.getState()
        // Selections that cannot be combined are explained in the builder, not run.
        if (multiSourceIssues(selection).length) return
        const runs = buildSelectionRuns(selection, orgUnitSelection, displayProperty)
        if (runs) await run(runs)
    }, [store, run, displayProperty])

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

        const runs = buildSelectionRuns(state.selection, state.orgUnits, displayProperty)
        if (!missing && runs && !multiSourceIssues(state.selection).length) void run(runs)
        else reset()
    }, [
        visualId,
        visual.data,
        dataSources.data,
        loadedId,
        applicationTitle,
        displayProperty,
        dispatch,
        run,
        reset,
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
        runAnalytics,
        adopt,
        saved: visual.data,
        isLoading:
            visual.isLoading || dataSources.isLoading || loadedId !== (visualId ?? NEW_VISUAL),
        error: visual.error ?? dataSources.error,
        missingDataSource,
    }
}
