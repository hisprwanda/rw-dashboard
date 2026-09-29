import { EmptyState } from '@/shared/components'
import { useToggleFavorite } from '../hooks/useToggleFavorite'
import type { SavedDashboardEntry } from '../types/dashboard.types'
import { isFavoriteOf } from '../utils/dashboardLists'
import { DashboardCard } from './DashboardCard'

interface DashboardGridProps {
    entries: SavedDashboardEntry[]
    userId: string | undefined
    emptyMessage: string
}

export const DashboardGrid = ({ entries, userId, emptyMessage }: DashboardGridProps) => {
    const favorite = useToggleFavorite()
    if (!entries.length) return <EmptyState message={emptyMessage} />
    return (
        <div className="flex flex-wrap gap-4">
            {entries.map((entry) => (
                <DashboardCard
                    key={entry.key}
                    entry={entry}
                    isFavorite={isFavoriteOf(entry, userId)}
                    favoriteLoading={favorite.pendingKey === entry.key}
                    onToggleFavorite={() => favorite.toggle(entry.key)}
                />
            ))}
        </div>
    )
}
