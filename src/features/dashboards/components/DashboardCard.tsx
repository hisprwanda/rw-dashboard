import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, IconVisualizationColumn24 } from '@dhis2/ui'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import type { SavedDashboardEntry } from '../types/dashboard.types'
import { FavoriteButton } from './FavoriteButton'

interface DashboardCardProps {
    entry: SavedDashboardEntry
    isFavorite?: boolean
    favoriteLoading?: boolean
    /** Shows the star when provided. */
    onToggleFavorite?: () => void
}

/** Preview card: screenshot, name, last update, open / present and the star. */
export const DashboardCard = ({
    entry,
    isFavorite = false,
    favoriteLoading,
    onToggleFavorite,
}: DashboardCardProps) => {
    const navigate = useNavigate()
    const { dashboardName, previewImg, updatedAt } = entry.value
    return (
        <article className="flex w-[280px] min-w-[280px] flex-col overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => navigate(paths.dashboard(entry.key))}
                className="flex h-40 items-center justify-center overflow-hidden border-0 bg-gray-100 p-0"
                aria-label={i18n.t('Open {{name}}', { name: dashboardName })}
            >
                {previewImg ? (
                    <img src={previewImg} alt="" className="h-full w-full object-cover" />
                ) : (
                    <IconVisualizationColumn24 />
                )}
            </button>
            <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                    <h3 className="m-0 truncate text-sm font-semibold text-gray-800">
                        {dashboardName}
                    </h3>
                    <p className="m-0 mt-1 text-xs text-gray-500">
                        {i18n.t('Updated {{date}}', {
                            date: new Date(updatedAt).toLocaleDateString(),
                        })}
                    </p>
                </div>
                {onToggleFavorite && (
                    <FavoriteButton
                        isFavorite={isFavorite}
                        loading={favoriteLoading}
                        onToggle={onToggleFavorite}
                    />
                )}
            </div>
            <div className="px-3 pb-3">
                <ButtonStrip>
                    <Button small onClick={() => navigate(paths.dashboard(entry.key))}>
                        {i18n.t('Open')}
                    </Button>
                    <Button small onClick={() => navigate(paths.presentDashboard(entry.key))}>
                        {i18n.t('Present')}
                    </Button>
                </ButtonStrip>
            </div>
        </article>
    )
}
