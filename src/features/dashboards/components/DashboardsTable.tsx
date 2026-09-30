import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useMe } from '@/features/auth'
import { ConfirmModal, DataTable, type DataTableColumn } from '@/shared/components'
import { formatDate } from '@/shared/utils/format'
import { useDeleteDashboard } from '../hooks/useDeleteDashboard'
import { useToggleFavorite } from '../hooks/useToggleFavorite'
import type { SavedDashboardEntry } from '../types/dashboard.types'
import { isFavoriteOf } from '../utils/dashboardLists'
import { FavoriteButton } from './FavoriteButton'
import { DashboardSharingModal } from './DashboardSharingModal'

interface DashboardsTableProps {
    rows: SavedDashboardEntry[] | undefined
    scope: 'mine' | 'shared'
    loading?: boolean
    error?: unknown
    onRetry?: () => void
}

const formatUpdated = (timestamp: number | undefined) => (timestamp ? formatDate(timestamp) : '')

/** Dashboards with open, present, star and (for own dashboards) share and delete. */
export const DashboardsTable = ({ rows, scope, loading, error, onRetry }: DashboardsTableProps) => {
    const navigate = useNavigate()
    const { data: me } = useMe()
    const favorite = useToggleFavorite()
    const remove = useDeleteDashboard()
    const [toDelete, setToDelete] = useState<SavedDashboardEntry | null>(null)
    const [toShare, setToShare] = useState<SavedDashboardEntry | null>(null)

    const columns = useMemo<DataTableColumn<SavedDashboardEntry>[]>(
        () => [
            {
                key: 'name',
                header: i18n.t('Name'),
                value: (e) => e.value.dashboardName,
                sortable: true,
            },
            ...(scope === 'shared'
                ? [
                      {
                          key: 'owner',
                          header: i18n.t('Created by'),
                          value: (e: SavedDashboardEntry) => e.value.createdBy?.name,
                          sortable: true,
                      },
                  ]
                : []),
            {
                key: 'created',
                header: i18n.t('Created'),
                value: (e) => e.value.createdAt,
                render: (e) => formatUpdated(e.value.createdAt),
                sortable: true,
                searchable: false,
            },
            {
                key: 'updated',
                header: i18n.t('Last updated'),
                value: (e) => e.value.updatedAt,
                render: (e) => formatUpdated(e.value.updatedAt),
                sortable: true,
                searchable: false,
            },
            {
                key: 'actions',
                header: i18n.t('Actions'),
                value: () => '',
                searchable: false,
                align: 'right',
                render: (entry) => (
                    <ButtonStrip end>
                        <FavoriteButton
                            isFavorite={isFavoriteOf(entry, me?.id)}
                            loading={favorite.pendingKey === entry.key}
                            onToggle={() => favorite.toggle(entry.key)}
                        />
                        <Button small onClick={() => navigate(paths.dashboard(entry.key))}>
                            {i18n.t('Open')}
                        </Button>
                        <Button small onClick={() => navigate(paths.presentDashboard(entry.key))}>
                            {i18n.t('Present')}
                        </Button>
                        {scope === 'mine' && (
                            <>
                                <Button small onClick={() => setToShare(entry)}>
                                    {i18n.t('Share')}
                                </Button>
                                <Button small destructive onClick={() => setToDelete(entry)}>
                                    {i18n.t('Delete')}
                                </Button>
                            </>
                        )}
                    </ButtonStrip>
                ),
            },
        ],
        [scope, navigate, me?.id, favorite]
    )

    return (
        <>
            <DataTable
                key={scope}
                columns={columns}
                rows={rows}
                getRowKey={(entry) => entry.key}
                loading={loading}
                error={error}
                onRetry={onRetry}
                emptyMessage={
                    scope === 'mine'
                        ? i18n.t('You have not created any dashboard yet.')
                        : i18n.t('No dashboard is shared with you.')
                }
            />
            {toShare && (
                <DashboardSharingModal
                    dashboardKey={toShare.key}
                    dashboardName={toShare.value.dashboardName}
                    onClose={() => setToShare(null)}
                />
            )}
            {toDelete && (
                <ConfirmModal
                    title={i18n.t('Delete dashboard')}
                    destructive
                    confirmLabel={i18n.t('Delete')}
                    loading={remove.isPending}
                    onCancel={() => setToDelete(null)}
                    onConfirm={() =>
                        remove.mutate(toDelete.key, { onSuccess: () => setToDelete(null) })
                    }
                >
                    {i18n.t('Delete "{{name}}"? This cannot be undone.', {
                        name: toDelete.value.dashboardName,
                    })}
                </ConfirmModal>
            )}
        </>
    )
}
