import { useParams } from 'react-router-dom'
import { DashboardEditor } from '@/features/dashboards'

/** `/dashboard/:id?`: build a new dashboard or edit a saved one. */
export default function DashboardEditorPage() {
    const { id } = useParams<{ id?: string }>()
    return <DashboardEditor dashboardId={id} />
}
