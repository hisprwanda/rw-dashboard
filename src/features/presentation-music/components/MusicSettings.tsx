import i18n from '@dhis2/d2-i18n'
import { Button, IconAdd24 } from '@dhis2/ui'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { ConfirmModal, DataTable, PageHeader, type DataTableColumn } from '@/shared/components'
import { useNotify } from '@/shared/hooks'
import { useDeleteTrack } from '../hooks/useDeleteTrack'
import { useMusicTracks } from '../hooks/useMusicTracks'
import { useUploadTrack } from '../hooks/useUploadTrack'
import { checkTrackFile, MAX_TRACK_BYTES } from '../services/musicService'
import type { PlayableTrack } from '../types/music.types'

/** Settings > Presentation music: upload, preview and delete the tracks offered in presentations. */
export const MusicSettings = () => {
    const { data: tracks, isLoading, error, refetch } = useMusicTracks()
    const upload = useUploadTrack()
    const remove = useDeleteTrack()
    const notify = useNotify()
    const inputRef = useRef<HTMLInputElement>(null)
    const [toDelete, setToDelete] = useState<PlayableTrack | null>(null)

    const onFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        const problem = checkTrackFile(file)
        if (problem === 'type') notify.error(i18n.t('Choose an MP3 file.'))
        else if (problem === 'size') {
            notify.error(
                i18n.t('The file is too large (maximum {{size}} MB).', {
                    size: MAX_TRACK_BYTES / (1024 * 1024),
                })
            )
        } else upload.mutate(file)
    }

    const columns = useMemo<DataTableColumn<PlayableTrack>[]>(
        () => [
            { key: 'name', header: i18n.t('Name'), value: (t) => t.name, sortable: true },
            {
                key: 'preview',
                header: i18n.t('Preview'),
                value: () => '',
                searchable: false,
                render: (track) => (
                    // Background music only (no speech), so captions do not apply.
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <audio controls preload="none" src={track.src} className="h-8" />
                ),
            },
            {
                key: 'actions',
                header: i18n.t('Actions'),
                value: () => '',
                searchable: false,
                align: 'right',
                render: (track) => (
                    <Button small destructive onClick={() => setToDelete(track)}>
                        {i18n.t('Delete')}
                    </Button>
                ),
            },
        ],
        []
    )

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title={i18n.t('Presentation music')}
                description={i18n.t(
                    'MP3 tracks users can play as background music during dashboard presentations.'
                )}
                actions={
                    <Button
                        primary
                        icon={<IconAdd24 />}
                        loading={upload.isPending}
                        onClick={() => inputRef.current?.click()}
                    >
                        {i18n.t('Upload track')}
                    </Button>
                }
            />
            <input
                ref={inputRef}
                type="file"
                accept=".mp3,audio/mpeg"
                className="hidden"
                aria-label={i18n.t('Upload track')}
                onChange={onFile}
            />
            <div className="px-6 pb-6">
                <DataTable
                    columns={columns}
                    rows={tracks}
                    getRowKey={(track) => track.id}
                    loading={isLoading}
                    error={error}
                    onRetry={() => void refetch()}
                    emptyMessage={i18n.t(
                        'No tracks yet. Upload an MP3 to use it in presentations.'
                    )}
                />
            </div>
            {toDelete && (
                <ConfirmModal
                    title={i18n.t('Delete track')}
                    destructive
                    confirmLabel={i18n.t('Delete')}
                    loading={remove.isPending}
                    onCancel={() => setToDelete(null)}
                    onConfirm={() =>
                        remove.mutate(toDelete, { onSuccess: () => setToDelete(null) })
                    }
                >
                    {i18n.t('Delete "{{name}}"? It will no longer be available in presentations.', {
                        name: toDelete.name,
                    })}
                </ConfirmModal>
            )}
        </div>
    )
}
