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
import type { AnalyticsRequest } from '@/features/analytics'
import { useMe } from '@/features/auth'
import { generateUid } from '@/shared/utils/uid'
import { useMaps } from '../hooks/useMaps'
import { useSaveMap } from '../hooks/useSaveMap'
import { saveMapSchema, type SaveMapFormValues } from '../schemas/saveMapSchema'
import type { GeoFeaturesParams, SavedMap } from '../types/map.types'
import { isMapNameTaken } from '../utils/mapNames'

interface SaveMapModalProps {
    /** Key of the map being updated; omitted for a new map. */
    mapId?: string
    /** The stored version of the map being updated (keeps creator, sharing…). */
    saved?: SavedMap
    /** Requests of the last layer run. */
    request: AnalyticsRequest | null
    geoFeatures: GeoFeaturesParams | undefined
    onClose: () => void
    onSaved: (key: string, name: string) => void
}

/** Saves the map currently in the builder (Redux state) to the dataStore. */
export const SaveMapModal = ({
    mapId,
    saved,
    request,
    geoFeatures,
    onClose,
    onSaved,
}: SaveMapModalProps) => {
    const { data: me } = useMe()
    const { data: maps } = useMaps()
    const save = useSaveMap()
    const selection = useAppSelector((state) => state.selection)
    const orgUnits = useAppSelector((state) => state.orgUnitSelection)
    const mapBuilder = useAppSelector((state) => state.mapBuilder)
    const canSave = !!request && !!geoFeatures

    const { control, handleSubmit, setError } = useForm<SaveMapFormValues>({
        defaultValues: { mapName: saved?.mapName ?? '', description: saved?.description ?? '' },
        resolver: zodResolver(saveMapSchema),
    })

    const onSubmit = handleSubmit(async ({ mapName, description }) => {
        if (isMapNameTaken(maps, mapName, mapId)) {
            setError('mapName', { message: i18n.t('Another map already uses this name.') })
            return
        }
        if (!request || !geoFeatures || !me) return
        const now = Date.now()
        const author = { id: me.id, name: me.displayName ?? me.name ?? '' }
        const map: SavedMap = {
            ...saved,
            id: saved?.id ?? mapId ?? generateUid(),
            mapName: mapName.trim(),
            mapType: 'Thematic',
            description,
            dataSourceId: selection.dataSourceId,
            queries: {
                mapAnalyticsQueryOne: request.storedQuery,
                mapAnalyticsQueryTwo: request.storedMapQuery ?? request.storedQuery,
                geoFeaturesQuery: { result: { resource: 'geoFeatures', params: geoFeatures } },
            },
            organizationTree: orgUnits.selectedTreePaths,
            selectedOrgUnitLevel: orgUnits.selectedLevels ?? undefined,
            backedSelectedItems: selection.selectedDataItems,
            BasemapType: mapBuilder.basemap,
            mapSettings: mapBuilder.settings,
            createdBy: saved?.createdBy ?? author,
            createdAt: saved?.createdAt ?? now,
            updatedBy: author,
            updatedAt: now,
        }
        const key = await save.mutateAsync({ key: mapId, map })
        onSaved(key, map.mapName)
    })

    return (
        <Modal onClose={onClose} position="middle">
            <ModalTitle>{mapId ? i18n.t('Update map') : i18n.t('Save map')}</ModalTitle>
            <ModalContent>
                {!canSave && (
                    <div className="mb-4">
                        <NoticeBox warning title={i18n.t('Nothing to save yet')}>
                            {i18n.t('Add a thematic layer first.')}
                        </NoticeBox>
                    </div>
                )}
                <form id="save-map-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                    <Controller
                        name="mapName"
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
                        form="save-map-form"
                        loading={save.isPending}
                        disabled={!canSave}
                    >
                        {mapId ? i18n.t('Update') : i18n.t('Save')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
