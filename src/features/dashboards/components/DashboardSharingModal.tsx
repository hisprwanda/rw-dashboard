import i18n from '@dhis2/d2-i18n'
import { SharingModal } from '@/shared/components'
import { useDashboard } from '../hooks/useDashboard'
import { useUpdateDashboard } from '../hooks/useUpdateDashboard'

interface DashboardSharingModalProps {
    dashboardKey: string
    dashboardName: string
    onClose: () => void
}

/** Sharing of one dashboard (read-modify-write of the stored dashboard). */
export const DashboardSharingModal = ({
    dashboardKey,
    dashboardName,
    onClose,
}: DashboardSharingModalProps) => {
    const dashboard = useDashboard(dashboardKey)
    const update = useUpdateDashboard()
    return (
        <SharingModal
            name={dashboardName}
            value={dashboard.data}
            loading={dashboard.isLoading}
            error={dashboard.error}
            saving={update.isPending}
            onSave={(change) =>
                update.mutate({
                    key: dashboardKey,
                    update: (current) => ({ ...current, ...change(current) }),
                    successMessage: i18n.t('Sharing settings saved'),
                })
            }
            onClose={onClose}
        />
    )
}
