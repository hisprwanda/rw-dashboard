import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, IconAdd24, NoticeBox, Tab, TabBar } from '@dhis2/ui'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useMe, useUserLocale } from '@/features/auth'
import { useDataSources } from '@/features/data-sources'
import { periodTypeLabel } from '@/features/periods'
import { ConfirmModal, DataTable, PageHeader, type DataTableColumn } from '@/shared/components'
import { downloadText, fileNameOf } from '@/shared/utils/download'
import { formatDate } from '@/shared/utils/format'
import { isCreatedBy, isSharedWith } from '@/shared/utils/sharing'
import { useLegacyTemplate } from '../hooks/useLegacyTemplate'
import {
    useBulletinTemplates,
    useDeleteBulletinTemplate,
    useSaveBulletinTemplate,
} from '../hooks/useBulletinTemplates'
import type { BulletinTemplate, BulletinTemplateEntry } from '../types/bulletin.types'
import { legacyTemplateToSections } from '../utils/legacyTemplate'
import { newTemplate } from '../utils/newTemplate'
import { fromTemplateFile, toTemplateFile } from '../utils/templateFile'
import { BulletinSharingModal } from './BulletinSharingModal'

type Scope = 'mine' | 'shared'

/** Bulletins list: open an issue, edit, share, export/import and delete. */
export const BulletinsManagement = () => {
    const navigate = useNavigate()
    const { data: me } = useMe()
    const locale = useUserLocale()
    const templates = useBulletinTemplates()
    const dataSources = useDataSources()
    const legacy = useLegacyTemplate()
    const save = useSaveBulletinTemplate()
    const remove = useDeleteBulletinTemplate()
    const fileInput = useRef<HTMLInputElement>(null)
    const [scope, setScope] = useState<Scope>('mine')
    const [toDelete, setToDelete] = useState<BulletinTemplateEntry | null>(null)
    const [toShare, setToShare] = useState<BulletinTemplateEntry | null>(null)
    const [importError, setImportError] = useState<string | null>(null)

    const author = me ? { id: me.id, name: me.displayName ?? me.name ?? '' } : undefined
    const language = locale.split(/[-_]/)[0] ?? 'en'
    const groupIds = useMemo(() => me?.userGroups?.map((g) => g.id) ?? [], [me])
    const rows = useMemo(
        () =>
            templates.data?.filter(({ value }) =>
                scope === 'mine'
                    ? isCreatedBy(value, me?.id)
                    : isSharedWith(value, me?.id, groupIds)
            ),
        [templates.data, scope, me, groupIds]
    )

    const create = (template: BulletinTemplate) =>
        save.mutate({ template }, { onSuccess: ({ key }) => navigate(paths.editBulletin(key)) })

    const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file || !author) return
        const result = fromTemplateFile(
            await file.text(),
            author,
            Date.now(),
            (dataSources.data ?? []).map((entry) => entry.key)
        )
        if (!result.ok) {
            setImportError(
                result.error === 'invalid-json'
                    ? i18n.t('The file is not valid JSON.')
                    : i18n.t('The file is not a bulletin template. {{details}}', {
                          details: result.details ?? '',
                      })
            )
            return
        }
        setImportError(null)
        create(result.template)
    }

    const importLegacy = () => {
        if (!author) return
        create(
            newTemplate(
                i18n.t('Imported bulletin'),
                language,
                author,
                Date.now(),
                legacyTemplateToSections(legacy.data, language)
            )
        )
    }

    const columns: DataTableColumn<BulletinTemplateEntry>[] = [
        { key: 'name', header: i18n.t('Name'), value: (e) => e.value.name, sortable: true },
        {
            key: 'period',
            header: i18n.t('Period type'),
            value: (e) => periodTypeLabel(e.value.periodType),
            sortable: true,
        },
        {
            key: 'sections',
            header: i18n.t('Sections'),
            value: (e) => e.value.sections.length,
            searchable: false,
        },
        ...(scope === 'shared'
            ? [
                  {
                      key: 'owner',
                      header: i18n.t('Created by'),
                      value: (e: BulletinTemplateEntry) => e.value.createdBy?.name,
                      sortable: true,
                  },
              ]
            : []),
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
                    <Button small primary onClick={() => navigate(paths.bulletinIssue(entry.key))}>
                        {i18n.t('Open')}
                    </Button>
                    <Button
                        small
                        onClick={() =>
                            downloadText(
                                `${fileNameOf(entry.value.name, 'bulletin')}.json`,
                                toTemplateFile(entry.value)
                            )
                        }
                    >
                        {i18n.t('Export')}
                    </Button>
                    {scope === 'mine' && (
                        <>
                            <Button small onClick={() => navigate(paths.editBulletin(entry.key))}>
                                {i18n.t('Edit')}
                            </Button>
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
    ]

    return (
        <div className="mx-auto w-full max-w-6xl">
            <PageHeader
                title={i18n.t('Bulletins')}
                description={i18n.t(
                    'Periodic bulletins built from your data. Design them once, then publish one issue per period.'
                )}
                actions={
                    <>
                        {legacy.data && (
                            <Button loading={save.isPending} onClick={importLegacy}>
                                {i18n.t('Import old bulletin texts')}
                            </Button>
                        )}
                        <Button onClick={() => fileInput.current?.click()}>
                            {i18n.t('Import JSON')}
                        </Button>
                        <Button
                            primary
                            icon={<IconAdd24 />}
                            onClick={() => navigate(paths.newBulletin)}
                        >
                            {i18n.t('New bulletin')}
                        </Button>
                    </>
                }
            />
            <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label={i18n.t('Import JSON')}
                onChange={(event) => void onImportFile(event)}
            />
            {importError && (
                <div className="px-6 pb-4">
                    <NoticeBox error title={i18n.t('Import failed')}>
                        {importError}
                    </NoticeBox>
                </div>
            )}
            <div className="px-6">
                <TabBar>
                    <Tab selected={scope === 'mine'} onClick={() => setScope('mine')}>
                        {i18n.t('My bulletins')}
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
                    loading={templates.isLoading}
                    error={templates.error}
                    onRetry={() => void templates.refetch()}
                    emptyMessage={
                        scope === 'mine'
                            ? i18n.t('You have not created any bulletin yet.')
                            : i18n.t('No bulletin is shared with you.')
                    }
                />
            </div>
            {toShare && (
                <BulletinSharingModal
                    templateKey={toShare.key}
                    name={toShare.value.name}
                    onClose={() => setToShare(null)}
                />
            )}
            {toDelete && (
                <ConfirmModal
                    title={i18n.t('Delete bulletin')}
                    destructive
                    confirmLabel={i18n.t('Delete')}
                    loading={remove.isPending}
                    onCancel={() => setToDelete(null)}
                    onConfirm={() =>
                        remove.mutate(toDelete.key, { onSuccess: () => setToDelete(null) })
                    }
                >
                    {i18n.t('Delete "{{name}}"? Its saved issues stay in the data store.', {
                        name: toDelete.value.name,
                    })}
                </ConfirmModal>
            )}
        </div>
    )
}
