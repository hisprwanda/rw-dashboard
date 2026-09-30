import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, IconAdd24, Tab, TabBar } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useMe } from '@/features/auth'
import { chartTypeLabel } from '@/features/charts'
import { ConfirmModal, DataTable, PageHeader, type DataTableColumn } from '@/shared/components'
import { isCreatedBy, isSharedWith } from '@/shared/utils/sharing'
import { formatDateTime } from '@/shared/utils/format'
import { useDeleteVisual } from '../hooks/useDeleteVisual'
import { useVisuals } from '../hooks/useVisuals'
import type { SavedVisualEntry } from '../types/visual.types'

type Scope = 'mine' | 'shared'

const formatUpdated = (timestamp: number | undefined) =>
    timestamp ? formatDateTime(timestamp) : ''

/** Visualizations list: mine vs. shared with me, open and delete. */
export const VisualsManagement = () => {
    const navigate = useNavigate()
    const { data: me } = useMe()
    const { data: visuals, isLoading, error, refetch } = useVisuals()
    const remove = useDeleteVisual()
    const [scope, setScope] = useState<Scope>('mine')
    const [toDelete, setToDelete] = useState<SavedVisualEntry | null>(null)

    const groupIds = useMemo(() => me?.userGroups?.map((group) => group.id) ?? [], [me])
    const rows = useMemo(
        () =>
            visuals?.filter(({ value }) =>
                scope === 'mine'
                    ? isCreatedBy(value, me?.id)
                    : isSharedWith(value, me?.id, groupIds)
            ),
        [visuals, scope, me, groupIds]
    )

    const columns = useMemo<DataTableColumn<SavedVisualEntry>[]>(
        () => [
            {
                key: 'name',
                header: i18n.t('Name'),
                value: (e) => e.value.visualName,
                sortable: true,
            },
            {
                key: 'type',
                header: i18n.t('Type'),
                value: (e) => chartTypeLabel(e.value.visualType),
                sortable: true,
            },
            ...(scope === 'shared'
                ? [
                      {
                          key: 'owner',
                          header: i18n.t('Created by'),
                          value: (e: SavedVisualEntry) => e.value.createdBy?.name,
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
                        <Button small onClick={() => navigate(paths.visualizer(entry.key))}>
                            {i18n.t('Open')}
                        </Button>
                        {scope === 'mine' && (
                            <Button small destructive onClick={() => setToDelete(entry)}>
                                {i18n.t('Delete')}
                            </Button>
                        )}
                    </ButtonStrip>
                ),
            },
        ],
        [scope, navigate]
    )

    return (
        <div className="mx-auto w-full max-w-6xl">
            <PageHeader
                title={i18n.t('Visualizations')}
                actions={
                    <Button
                        primary
                        icon={<IconAdd24 />}
                        onClick={() => navigate(paths.visualizer())}
                    >
                        {i18n.t('New visualization')}
                    </Button>
                }
            />
            <div className="px-6">
                <TabBar>
                    <Tab selected={scope === 'mine'} onClick={() => setScope('mine')}>
                        {i18n.t('My visualizations')}
                    </Tab>
                    <Tab selected={scope === 'shared'} onClick={() => setScope('shared')}>
                        {i18n.t('Shared with me')}
                    </Tab>
                </TabBar>
            </div>
            <div className="p-6">
                <DataTable
                    key={scope}
                    columns={columns}
                    rows={rows}
                    getRowKey={(entry) => entry.key}
                    loading={isLoading}
                    error={error}
                    onRetry={() => void refetch()}
                    emptyMessage={
                        scope === 'mine'
                            ? i18n.t('You have not saved any visualization yet.')
                            : i18n.t('No visualization is shared with you.')
                    }
                />
            </div>

            {toDelete && (
                <ConfirmModal
                    title={i18n.t('Delete visualization')}
                    destructive
                    confirmLabel={i18n.t('Delete')}
                    loading={remove.isPending}
                    onCancel={() => setToDelete(null)}
                    onConfirm={() =>
                        remove.mutate(toDelete.key, { onSuccess: () => setToDelete(null) })
                    }
                >
                    {i18n.t('Delete "{{name}}"? Dashboards that show it will lose this item.', {
                        name: toDelete.value.visualName,
                    })}
                </ConfirmModal>
            )}
        </div>
    )
}
