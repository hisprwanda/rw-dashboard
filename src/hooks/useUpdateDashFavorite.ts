import { useState } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { env } from '@/shared/constants/env'

// Define DashboardValue type
interface DashboardValue {
    favorites: string[] | undefined
    // add other fields that you might need from DashboardValue
}

interface UseUpdateDashboardFavoriteProps {
    userId: string
    refetch?: () => void
}

export const useUpdateDashboardFavorite = ({
    userId,
    refetch,
}: UseUpdateDashboardFavoriteProps) => {
    const engine = useDataEngine()
    const [isUpdatingDashboard, setIsUpdatingDashboard] = useState(false)

    const toggleFavorite = async (dashboardId: string, dashboard: DashboardValue) => {
        const isFavorited = dashboard.favorites?.includes(userId)
        const updatedFavorites = isFavorited
            ? dashboard.favorites?.filter((id) => id !== userId)
            : [...(dashboard.favorites || []), userId]

        try {
            setIsUpdatingDashboard(true)
            await engine.mutate({
                resource: `dataStore/${env.dashboardStore}/${dashboardId}`,
                type: 'update',
                data: { ...dashboard, favorites: updatedFavorites },
            })

            if (refetch) refetch()
        } catch (error) {
            console.error('Error updating dashboard favorite status:', error)
        } finally {
            setIsUpdatingDashboard(false)
        }
    }

    return { toggleFavorite, isUpdatingDashboard }
}
