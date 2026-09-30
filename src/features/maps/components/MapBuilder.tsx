import i18n from '@dhis2/d2-i18n'
import { Button, IconAdd16, IconEdit16, IconSave16, NoticeBox } from '@dhis2/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { ErrorState, LoadingState } from '@/shared/components'
import { basemaps } from '../constants/basemaps'
import { useMapBuilder } from '../hooks/useMapBuilder'
import { mapBuilderActions } from '../store/mapBuilderSlice'
import type { BasemapType } from '../types/map.types'
import { SaveMapModal } from './SaveMapModal'
import { ThematicLayerModal } from './ThematicLayerModal'
import { ThematicMap } from './ThematicMap'

interface MapBuilderProps {
    /** Key of the saved map to edit; omitted to build a new one. */
    mapId?: string
}

/** Builds, previews and saves a thematic map. */
export const MapBuilder = ({ mapId }: MapBuilderProps) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const builder = useMapBuilder(mapId)
    const basemap = useAppSelector((state) => state.mapBuilder.basemap)
    const settings = useAppSelector((state) => state.mapBuilder.settings)
    const [modal, setModal] = useState<'layer' | 'save' | null>(null)
    const hasLayer = !!builder.request

    if (builder.error) return <ErrorState error={builder.error} />
    if (builder.isLoading) return <LoadingState />

    const close = () => setModal(null)
    const options = basemaps()

    return (
        <div className="flex h-[calc(100vh-50px)] w-full">
            <aside className="flex w-64 shrink-0 flex-col gap-4 border-r border-gray-200 bg-white p-3">
                <Button primary icon={<IconSave16 />} onClick={() => setModal('save')}>
                    {mapId ? i18n.t('Save changes') : i18n.t('Save map')}
                </Button>
                <section>
                    <h4 className="mb-2 mt-0 text-xs uppercase text-gray-500">
                        {i18n.t('Layers')}
                    </h4>
                    <Button
                        small
                        icon={hasLayer ? <IconEdit16 /> : <IconAdd16 />}
                        onClick={() => setModal('layer')}
                    >
                        {hasLayer ? i18n.t('Edit thematic layer') : i18n.t('Add thematic layer')}
                    </Button>
                </section>
                <section>
                    <h4 className="mb-2 mt-0 text-xs uppercase text-gray-500">
                        {i18n.t('Basemap')}
                    </h4>
                    <ul className="m-0 list-none p-0">
                        {(Object.keys(options) as BasemapType[]).map((key) => (
                            <li key={key}>
                                <button
                                    type="button"
                                    aria-pressed={basemap === key}
                                    onClick={() => dispatch(mapBuilderActions.setBasemap(key))}
                                    className={`flex w-full items-center gap-2 px-2 py-1 text-left text-sm ${
                                        basemap === key
                                            ? 'border-l-2 border-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <img
                                        src={options[key].thumbnail}
                                        alt=""
                                        className="h-6 w-6 border border-gray-300"
                                    />
                                    {options[key].name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            </aside>

            <main className="relative flex-grow">
                {builder.missingDataSource && (
                    <div className="absolute left-4 right-4 top-4 z-[1100]">
                        <NoticeBox warning title={i18n.t('Data source not available')}>
                            {i18n.t(
                                'The data source of this map was deleted or is not shared with you. Pick another one in the thematic layer.'
                            )}
                        </NoticeBox>
                    </div>
                )}
                {builder.isRunning && (
                    <div className="absolute inset-0 z-[1100] bg-white/60">
                        <LoadingState label={i18n.t('Loading the layer')} />
                    </div>
                )}
                {builder.runError ? (
                    <ErrorState error={builder.runError} />
                ) : (
                    <ThematicMap
                        geoFeatures={builder.geoFeatures ?? []}
                        data={builder.data}
                        metaData={builder.metaData}
                        basemap={basemap}
                        settings={settings}
                        title={builder.saved?.mapName}
                    />
                )}
            </main>

            {modal === 'layer' && (
                <ThematicLayerModal
                    isEditing={hasLayer}
                    onClose={close}
                    onApply={builder.run}
                    applying={builder.isRunning}
                />
            )}
            {modal === 'save' && (
                <SaveMapModal
                    mapId={mapId}
                    saved={builder.saved}
                    request={builder.request}
                    geoFeatures={builder.geoFeaturesParams}
                    onClose={close}
                    onSaved={(key, name) => {
                        close()
                        if (!mapId) {
                            builder.adopt(key)
                            navigate(paths.map(key, name), { replace: true })
                        }
                    }}
                />
            )}
        </div>
    )
}
