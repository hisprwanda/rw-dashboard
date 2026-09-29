import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/app/store'
import { dashboardEditorActions } from '../store/dashboardEditorSlice'
import { useDashboard } from './useDashboard'

const NEW = 'new'

/** Loads a saved dashboard into the editor state (or resets it for a new one), once per id. */
export const useDashboardEditor = (dashboardId: string | undefined) => {
    const dispatch = useAppDispatch()
    const dashboard = useDashboard(dashboardId)
    const [loadedId, setLoadedId] = useState<string | null>(null)
    const target = dashboardId ?? NEW

    useEffect(() => {
        if (loadedId === target) return
        if (!dashboardId) {
            dispatch(dashboardEditorActions.resetDashboardEditor())
            setLoadedId(target)
        } else if (dashboard.data) {
            dispatch(dashboardEditorActions.loadDashboard(dashboard.data))
            setLoadedId(target)
        }
    }, [dashboardId, dashboard.data, loadedId, target, dispatch])

    return {
        saved: dashboard.data,
        isLoading: dashboard.isLoading || loadedId !== target,
        error: dashboard.error,
        /** After saving a new dashboard: its URL changes but the store already holds it. */
        adopt: setLoadedId,
    }
}
