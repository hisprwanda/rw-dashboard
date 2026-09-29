import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, IconAdd24, Tab, TabBar } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useMe } from '@/features/auth'
import { ConfirmModal, DataTable, PageHeader, type DataTableColumn } from '@/shared/components'
import { isCreatedBy, isSharedWith } from '@/shared/utils/sharing'
import { useDeleteMap } from '../hooks/useDeleteMap'
import { useMaps } from '../hooks/useMaps'
import type { SavedMapEntry } from '../types/map.types'

type Scope = 'mine' | 'shared'

const formatDate = (timestamp: number | undefined) =>
    timestamp ? new Date(timestamp).toLocaleString() : ''

/** Maps list: mine vs. shared with me, open and delete. */
export const MapsManagement = () => {
    const navigate = useNavigate()
    const { data: me } = useMe()
    const { data: maps, isLoading, error, refetch } = useMaps()
    const remove = useDeleteMap()
    const [scope, setScope] = useState<Scope>('mine')
    const [toDelete, setToDelete] = useState<SavedMapEntry | null>(null)

    const groupIds = useMemo(() => me?.userGroups?.map((group) => group.id) ?? [], [me])
    const rows = useMemo(
        () =>
            maps?.filter(({ value }) =>
                scope === 'mine'
                    ? isCreatedBy(value, me?.id)
                    : isSharedWith(value, me?.id, groupIds)
            ),
        [maps, scope, me, groupIds]
    )

    const columns = useMemo<DataTableColumn<SavedMapEntry>[]>(
        () => [
            {
                key: 'name',
                header: i18n.t('Name'),
                value: (e) => e.value.mapName,
                sortable: true,
            },
            {
                key: 'type',
                header: i18n.t('Type'),
                value: (e) => e.value.mapType,
                sortable: true,
            },
            ...(scope === 'shared'
                ? [
                      {
                          key: 'owner',
                          header: i18n.t('Created by'),
                          value: (e: SavedMapEntry) => e.value.createdBy?.name,
                          sortable: true,
                      },
                  ]
                : []),
            {
                key: 'created',
                header: i18n.t('Created'),
                value: (e) => e.value.createdAt,
                render: (e) => formatDate(e.value.createdAt),
                sortable: true,
                searchable: false,
            },
            {
                key: 'updated',
                header: i18n.t('Last updated'),
                value: (e) => e.value.updatedAt,
                render: (e) => formatDate(e.value.updatedAt),
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
                        <Button
                            small
                            onClick={() => navigate(paths.map(entry.key, entry.value.mapName))}
                        >
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
                title={i18n.t('Maps')}
                actions={
                    <Button primary icon={<IconAdd24 />} onClick={() => navigate(paths.map())}>
                        {i18n.t('New map')}
                    </Button>
                }
            />
            <div className="px-6">
                <TabBar>
                    <Tab selected={scope === 'mine'} onClick={() => setScope('mine')}>
                        {i18n.t('My maps')}
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
                            ? i18n.t('You have not saved any map yet.')
                            : i18n.t('No map is shared with you.')
                    }
                />
            </div>

            {toDelete && (
                <ConfirmModal
                    title={i18n.t('Delete map')}
                    destructive
                    confirmLabel={i18n.t('Delete')}
                    loading={remove.isPending}
                    onCancel={() => setToDelete(null)}
                    onConfirm={() =>
                        remove.mutate(toDelete.key, { onSuccess: () => setToDelete(null) })
                    }
                >
                    {i18n.t('Delete "{{name}}"? Dashboards that show it will lose this item.', {
                        name: toDelete.value.mapName,
                    })}
                </ConfirmModal>
            )}
        </div>
    )
}
