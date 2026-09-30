import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, IconAdd24 } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import { ConfirmModal, DataTable, PageHeader, type DataTableColumn } from '@/shared/components'
import { useDataSources } from '../hooks/useDataSources'
import { useDeleteDataSource } from '../hooks/useDeleteDataSource'
import type { DataSourceEntry } from '../types/dataSource.types'
import { DataSourceDetails } from './DataSourceDetails'
import { DataSourceForm } from './DataSourceForm'

type Dialog =
    | { kind: 'create' }
    | { kind: 'edit' | 'view' | 'delete'; entry: DataSourceEntry }
    | null

/** Settings > Data sources: list, create, view, edit and delete external instances. */
export const DataSourcesManagement = () => {
    const { data: sources, isLoading, error, refetch } = useDataSources()
    const remove = useDeleteDataSource()
    const [dialog, setDialog] = useState<Dialog>(null)
    const close = () => setDialog(null)

    const columns = useMemo<DataTableColumn<DataSourceEntry>[]>(
        () => [
            {
                key: 'name',
                header: i18n.t('Instance name'),
                value: (e) => e.value.instanceName,
                sortable: true,
            },
            { key: 'type', header: i18n.t('Type'), value: (e) => e.value.type, sortable: true },
            { key: 'url', header: i18n.t('URL'), value: (e) => e.value.url },
            {
                key: 'description',
                header: i18n.t('Description'),
                value: (e) => e.value.description,
            },
            {
                key: 'actions',
                header: i18n.t('Actions'),
                value: () => '',
                searchable: false,
                align: 'right',
                render: (entry) => (
                    <ButtonStrip end>
                        <Button small onClick={() => setDialog({ kind: 'view', entry })}>
                            {i18n.t('View')}
                        </Button>
                        <Button small onClick={() => setDialog({ kind: 'edit', entry })}>
                            {i18n.t('Edit')}
                        </Button>
                        <Button
                            small
                            destructive
                            onClick={() => setDialog({ kind: 'delete', entry })}
                        >
                            {i18n.t('Delete')}
                        </Button>
                    </ButtonStrip>
                ),
            },
        ],
        []
    )

    return (
        <div className="mx-auto w-full max-w-6xl">
            <PageHeader
                title={i18n.t('Data sources')}
                description={i18n.t(
                    'External DHIS2 instances that visualizations and maps can read data from.'
                )}
                actions={
                    <Button
                        primary
                        icon={<IconAdd24 />}
                        onClick={() => setDialog({ kind: 'create' })}
                    >
                        {i18n.t('New data source')}
                    </Button>
                }
            />
            <div className="px-6 pb-6">
                <DataTable
                    columns={columns}
                    rows={sources}
                    getRowKey={(entry) => entry.key}
                    loading={isLoading}
                    error={error}
                    onRetry={() => void refetch()}
                    emptyMessage={i18n.t(
                        'No data sources yet. Create one to read data from another instance.'
                    )}
                />
            </div>

            {dialog?.kind === 'create' && <DataSourceForm onClose={close} />}
            {dialog?.kind === 'edit' && <DataSourceForm entry={dialog.entry} onClose={close} />}
            {dialog?.kind === 'view' && (
                <DataSourceDetails dataSource={dialog.entry.value} onClose={close} />
            )}
            {dialog?.kind === 'delete' && (
                <ConfirmModal
                    title={i18n.t('Delete data source')}
                    destructive
                    confirmLabel={i18n.t('Delete')}
                    loading={remove.isPending}
                    onCancel={close}
                    onConfirm={() => remove.mutate(dialog.entry.key, { onSuccess: close })}
                >
                    {i18n.t(
                        'Delete "{{name}}"? Visualizations and maps using it will no longer load data.',
                        { name: dialog.entry.value.instanceName }
                    )}
                </ConfirmModal>
            )}
        </div>
    )
}
