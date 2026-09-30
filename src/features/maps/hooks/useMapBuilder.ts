import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppStore } from '@/app/store'
import { selectionActions, useAnalyticsRun, type SelectedDataSource } from '@/features/analytics'
import { CURRENT_INSTANCE_ID, useDataSources } from '@/features/data-sources'
import { orgUnitSelectionActions } from '@/features/org-units'
import { useApplicationTitle } from '@/features/system'
import type { InstanceConnection } from '@/shared/api'
import { mapBuilderActions } from '../store/mapBuilderSlice'
import type { GeoFeaturesParams } from '../types/map.types'
import { buildMapRequest, type MapRequest } from '../utils/mapRequest'
import { mapToBuilderState } from '../utils/mapState'
import { useGeoFeatures } from './useGeoFeatures'
import { useMap } from './useMap'

const NEW_MAP = 'new'

interface CommittedGeo {
    params: GeoFeaturesParams
    instance: InstanceConnection
}

/**
 * Everything the map builder needs: loads a saved map into the Redux slices (or resets
 * them for a new one) and runs the thematic layer (analytics + boundaries) on demand.
 */
export const useMapBuilder = (mapId: string | undefined) => {
    const dispatch = useAppDispatch()
    const store = useAppStore()
    const applicationTitle = useApplicationTitle()
    const analytics = useAnalyticsRun()
    const { run: runAnalytics, reset: resetAnalytics } = analytics
    const map = useMap(mapId)
    const dataSources = useDataSources()
    const [loadedId, setLoadedId] = useState<string | null>(null)
    const [missingDataSource, setMissingDataSource] = useState(false)
    const [geo, setGeo] = useState<CommittedGeo | null>(null)
    const geoFeatures = useGeoFeatures(geo?.params, geo?.instance)

    const start = useCallback(
        async (request: MapRequest, instance: InstanceConnection) => {
            setGeo({ params: request.geoFeatures, instance })
            await runAnalytics(request.analytics, instance)
        },
        [runAnalytics]
    )

    const reset = useCallback(() => {
        setGeo(null)
        resetAnalytics()
    }, [resetAnalytics])

    /** Runs the thematic layer of the current selection (no-op while it is incomplete). */
    const run = useCallback(async () => {
        const { selection, orgUnitSelection } = store.getState()
        const request = buildMapRequest(selection, orgUnitSelection)
        if (request) await start(request, selection.dataSource)
    }, [store, start])

    useEffect(() => {
        const target = mapId ?? NEW_MAP
        if (loadedId === target) return
        const currentInstance = { isCurrentInstance: true, instanceName: applicationTitle }

        if (!mapId) {
            dispatch(
                selectionActions.changeDataSource({
                    id: CURRENT_INSTANCE_ID,
                    dataSource: currentInstance,
                })
            )
            dispatch(orgUnitSelectionActions.resetOrgUnitSelection())
            dispatch(mapBuilderActions.resetMapBuilder())
            reset()
            setMissingDataSource(false)
            setLoadedId(target)
            return
        }

        if (!map.data || !dataSources.data) return
        const saved = map.data
        const isCurrent = !saved.dataSourceId || saved.dataSourceId === CURRENT_INSTANCE_ID
        const dataSource: SelectedDataSource | undefined = isCurrent
            ? currentInstance
            : dataSources.data.find((entry) => entry.key === saved.dataSourceId)?.value

        const state = mapToBuilderState(saved, dataSource ?? currentInstance)
        dispatch(selectionActions.setSelection(state.selection))
        dispatch(orgUnitSelectionActions.setOrgUnitSelection(state.orgUnits))
        dispatch(mapBuilderActions.setMapBuilder(state.mapBuilder))
        setMissingDataSource(!dataSource)
        setLoadedId(target)

        const request = buildMapRequest(state.selection, state.orgUnits)
        if (dataSource && request) void start(request, dataSource)
        else reset()
    }, [mapId, map.data, dataSources.data, loadedId, applicationTitle, dispatch, start, reset])

    /** After saving a new map: its URL changes but the store already holds it. */
    const adopt = useCallback((id: string) => setLoadedId(id), [])

    return {
        run,
        adopt,
        saved: map.data,
        /** Query of the last run (what gets saved). */
        request: analytics.request,
        geoFeaturesParams: geo?.params,
        data: analytics.data,
        metaData: analytics.metaData,
        geoFeatures: geoFeatures.data,
        isRunning: analytics.isFetching || geoFeatures.isFetching,
        runError: analytics.error ?? geoFeatures.error,
        isLoading: map.isLoading || dataSources.isLoading || loadedId !== (mapId ?? NEW_MAP),
        error: map.error ?? dataSources.error,
        missingDataSource,
    }
}
