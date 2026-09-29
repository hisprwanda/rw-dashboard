import { useParams } from 'react-router-dom'
import { DashboardPresenter } from '@/features/dashboards'

/** `/dashboard/:id/present`: slideshow of a saved dashboard. */
export default function DashboardPresentPage() {
    const { id = '' } = useParams<{ id: string }>()
    return <DashboardPresenter dashboardId={id} />
}
