import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
    TextAreaField,
} from '@dhis2/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useAppSelector } from '@/app/store'
import type { StoredAnalyticsQuery } from '@/features/analytics'
import { useMe } from '@/features/auth'
import { generateUid } from '@/shared/utils/uid'
import { useSaveVisual } from '../hooks/useSaveVisual'
import { useVisuals } from '../hooks/useVisuals'
import { saveVisualSchema, type SaveVisualFormValues } from '../schemas/saveVisualSchema'
import type { SavedVisual } from '../types/visual.types'
import { isVisualNameTaken } from '../utils/visualNames'

interface SaveVisualModalProps {
    /** Key of the visual being updated; omitted for a new visual. */
    visualId?: string
    /** The stored version of the visual being updated (keeps creator and creation date). */
    saved?: SavedVisual
    /** Query of the last analytics run (still held by the legacy context). */
    query: StoredAnalyticsQuery | null | undefined
    onClose: () => void
    onSaved: (key: string) => void
}

/** Saves the visual currently in the builder (Redux state) to the dataStore. */
export const SaveVisualModal = ({
    visualId,
    saved,
    query,
    onClose,
    onSaved,
}: SaveVisualModalProps) => {
    const { data: me } = useMe()
    const { data: visuals } = useVisuals()
    const save = useSaveVisual()
    const selection = useAppSelector((state) => state.selection)
    const visualizer = useAppSelector((state) => state.visualizer)
    const orgUnits = useAppSelector((state) => state.orgUnitSelection)

    const { control, handleSubmit, setError } = useForm<SaveVisualFormValues>({
        defaultValues: {
            visualName: saved?.visualName ?? '',
            description: saved?.description ?? '',
        },
        resolver: zodResolver(saveVisualSchema),
    })

    const onSubmit = handleSubmit(async ({ visualName, description }) => {
        if (isVisualNameTaken(visuals, visualName, visualId)) {
            setError('visualName', {
                message: i18n.t('Another visualization already uses this name.'),
            })
            return
        }
        if (!query || !me) return
        const now = Date.now()
        const author = { id: me.id, name: me.displayName ?? me.name ?? '' }
        const visual: SavedVisual = {
            ...saved,
            id: saved?.id ?? visualId ?? generateUid(),
            visualName: visualName.trim(),
            description,
            visualType: visualizer.chartType,
            visualTitleAndSubTitle: visualizer.titles,
            visualSettings: visualizer.settings,
            query,
            analyticsPayloadDeterminer: selection.layout,
            dataSourceId: selection.dataSourceId,
            backedSelectedItems: selection.selectedDataItems,
            organizationTree: orgUnits.selectedTreePaths,
            selectedOrgUnitLevel: orgUnits.selectedLevels ?? undefined,
            createdBy: saved?.createdBy ?? author,
            createdAt: saved?.createdAt ?? now,
            updatedBy: author,
            updatedAt: now,
        }
        const key = await save.mutateAsync({ key: visualId, visual })
        onSaved(key)
    })

    return (
        <Modal onClose={onClose} position="middle">
            <ModalTitle>
                {visualId ? i18n.t('Update visualization') : i18n.t('Save visualization')}
            </ModalTitle>
            <ModalContent>
                {!query && (
                    <div className="mb-4">
                        <NoticeBox warning title={i18n.t('Nothing to save yet')}>
                            {i18n.t(
                                'Select data, period and organisation unit, then click Update.'
                            )}
                        </NoticeBox>
                    </div>
                )}
                <form id="save-visual-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                    <Controller
                        name="visualName"
                        control={control}
                        render={({ field, fieldState }) => (
                            <InputField
                                name={field.name}
                                label={i18n.t('Name')}
                                required
                                value={field.value}
                                onChange={({ value }) => field.onChange(value ?? '')}
                                onBlur={field.onBlur}
                                error={!!fieldState.error}
                                validationText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextAreaField
                                name={field.name}
                                label={i18n.t('Description')}
                                value={field.value}
                                onChange={({ value }) => field.onChange(value ?? '')}
                                onBlur={field.onBlur}
                            />
                        )}
                    />
                </form>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={save.isPending}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        type="submit"
                        form="save-visual-form"
                        loading={save.isPending}
                        disabled={!query}
                    >
                        {visualId ? i18n.t('Update') : i18n.t('Save')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
