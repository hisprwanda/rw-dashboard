import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { ErrorState, LoadingState } from '@/shared/components'
import { useDashboard } from '../hooks/useDashboard'
import { inReadingOrder } from '../utils/dashboardItems'
import { DashboardPresentation } from './DashboardPresentation'

/** Presents a saved dashboard (`/dashboard/:id/present`). */
export const DashboardPresenter = ({ dashboardId }: { dashboardId: string }) => {
    const navigate = useNavigate()
    const { data, isLoading, error } = useDashboard(dashboardId)
    if (isLoading) return <LoadingState />
    if (error || !data) return <ErrorState error={error} />
    return (
        <DashboardPresentation
            name={data.dashboardName}
            items={inReadingOrder([
                ...(data.selectedVisuals ?? []),
                ...(data.selectedMaps ?? []),
                ...(data.selectedDhis2Items ?? []),
            ])}
            onExit={() => navigate(paths.dashboard(dashboardId))}
        />
    )
}
