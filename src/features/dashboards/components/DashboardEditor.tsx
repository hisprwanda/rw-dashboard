import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Checkbox,
    InputField,
    SingleSelectField,
    SingleSelectOption,
    TextAreaField,
} from '@dhis2/ui'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { Layout } from 'react-grid-layout'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { useMe } from '@/features/auth'
import { chartTypeLabel } from '@/features/charts'
import { CURRENT_INSTANCE_ID, useDataSources } from '@/features/data-sources'
import { Dhis2ObjectPickerModal, fetchObjectImageDataUrl } from '@/features/dhis2-objects'
import { mapTypeLabel, useMaps } from '@/features/maps'
import { useVisuals } from '@/features/visualizers'
import { ColorField, ErrorState, LoadingState } from '@/shared/components'
import { useFullscreen } from '@/shared/hooks'
import { useDashboardEditor } from '../hooks/useDashboardEditor'
import { useExportPptx } from '../hooks/useExportPptx'
import { useSaveDashboard } from '../hooks/useSaveDashboard'
import { dashboardEditorActions as actions } from '../store/dashboardEditorSlice'
import {
    dhis2ItemKey,
    inReadingOrder,
    toDhis2Item,
    toMapItem,
    toVisualItem,
} from '../utils/dashboardItems'
import { DashboardCanvas } from './DashboardCanvas'
import { isDhis2Item, itemTitle } from './DashboardItemContent'
import { DashboardPresentation } from './DashboardPresentation'

interface DashboardEditorProps {
    /** Key of the saved dashboard to edit; omitted for a new one. */
    dashboardId?: string
}

/** Builds a dashboard from saved visualizations and maps on a resizable grid. */
export const DashboardEditor = ({ dashboardId }: DashboardEditorProps) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { data: me } = useMe()
    const editor = useDashboardEditor(dashboardId)
    const draft = useAppSelector((state) => state.dashboardEditor)
    const visuals = useVisuals()
    const maps = useMaps()
    const save = useSaveDashboard()
    const engine = useDataEngine()
    const dataSources = useDataSources()
    const exportPptx = useExportPptx()
    const canvasRef = useRef<HTMLDivElement>(null)
    const fullscreen = useFullscreen(canvasRef)
    const [presenting, setPresenting] = useState(false)
    const [nameError, setNameError] = useState(false)
    const [pickingDhis2, setPickingDhis2] = useState(false)

    const items = useMemo(
        () => [...draft.visuals, ...draft.maps, ...draft.dhis2Items],
        [draft.visuals, draft.maps, draft.dhis2Items]
    )
    const count = items.length
    const onLayoutChange = useCallback(
        (layout: Layout[]) => dispatch(actions.applyGridLayout(layout)),
        [dispatch]
    )
    const onRemove = useCallback((id: string) => dispatch(actions.removeItem(id)), [dispatch])

    if (editor.error) return <ErrorState error={editor.error} />
    if (editor.isLoading) return <LoadingState />

    if (presenting) {
        return (
            <DashboardPresentation
                name={draft.name}
                items={inReadingOrder(items)}
                onExit={() => setPresenting(false)}
            />
        )
    }

    const onSave = () => {
        if (!draft.name.trim()) {
            setNameError(true)
            return
        }
        save.mutate(
            { key: dashboardId, draft, saved: editor.saved, previewElement: canvasRef.current },
            {
                onSuccess: ({ key }) => {
                    if (!dashboardId) {
                        editor.adopt(key)
                        navigate(paths.dashboard(key), { replace: true })
                    }
                },
            }
        )
    }

    const onExport = () => {
        if (!canvasRef.current) return
        exportPptx.mutate({
            name: draft.name || i18n.t('Dashboard'),
            items: inReadingOrder(items).map((item) => {
                if (!isDhis2Item(item)) return { id: item.i, title: itemTitle(item) }
                const instance =
                    item.dataSourceId === CURRENT_INSTANCE_ID
                        ? { isCurrentInstance: true }
                        : dataSources.data?.find((entry) => entry.key === item.dataSourceId)?.value
                return {
                    id: item.i,
                    title: itemTitle(item),
                    // Plugins draw in an iframe: DHIS2's image when the frame cannot be read.
                    fallbackImage: () =>
                        instance
                            ? fetchObjectImageDataUrl(
                                  engine,
                                  instance,
                                  item.objectType,
                                  item.objectId
                              )
                            : Promise.resolve(null),
                }
            }),
            backgroundColor: draft.backgroundColor,
            author: me?.displayName ?? '',
            root: canvasRef.current,
        })
    }

    const inDashboard = new Set(items.map((item) => item.i))

    return (
        <div className="flex flex-col gap-3 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-start gap-3">
                    <div className="w-72">
                        <InputField
                            dense
                            required
                            label={i18n.t('Name')}
                            value={draft.name}
                            error={nameError && !draft.name.trim()}
                            validationText={
                                nameError && !draft.name.trim()
                                    ? i18n.t('Name is required')
                                    : undefined
                            }
                            onChange={({ value }) => dispatch(actions.setName(value ?? ''))}
                        />
                    </div>
                    <div className="w-72">
                        <TextAreaField
                            dense
                            rows={2}
                            label={i18n.t('Description')}
                            value={draft.description}
                            onChange={({ value }) => dispatch(actions.setDescription(value ?? ''))}
                        />
                    </div>
                    <div className="flex flex-col gap-2 pt-6">
                        <Checkbox
                            dense
                            label={i18n.t('Official dashboard (pinned on the home page)')}
                            checked={draft.isOfficial}
                            onChange={({ checked }) => dispatch(actions.setOfficial(checked))}
                        />
                    </div>
                    <ColorField
                        label={i18n.t('Background')}
                        value={draft.backgroundColor}
                        onChange={(color) => dispatch(actions.setBackgroundColor(color))}
                    />
                </div>
                <ButtonStrip end>
                    <Button
                        small
                        loading={exportPptx.isPending}
                        disabled={!count}
                        onClick={onExport}
                    >
                        {i18n.t('Export to PowerPoint')}
                    </Button>
                    <Button small disabled={!count} onClick={() => void fullscreen.toggle()}>
                        {i18n.t('Full screen')}
                    </Button>
                    <Button small disabled={!count} onClick={() => setPresenting(true)}>
                        {i18n.t('Present')}
                    </Button>
                    <Button small primary loading={save.isPending} onClick={onSave}>
                        {dashboardId ? i18n.t('Save changes') : i18n.t('Save dashboard')}
                    </Button>
                </ButtonStrip>
            </div>

            <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <SingleSelectField
                    dense
                    filterable
                    noMatchText={i18n.t('No match')}
                    label={i18n.t('Add a visualization')}
                    placeholder={i18n.t('Select a visualization')}
                    loading={visuals.isLoading}
                    selected=""
                    onChange={({ selected }) => {
                        const entry = visuals.data?.find((e) => e.key === selected)
                        if (entry) dispatch(actions.addVisual(toVisualItem(entry, count)))
                    }}
                >
                    {(visuals.data ?? []).map((entry) => (
                        <SingleSelectOption
                            key={entry.key}
                            value={entry.key}
                            disabled={inDashboard.has(entry.key)}
                            label={`${entry.value.visualName} (${chartTypeLabel(entry.value.visualType)})`}
                        />
                    ))}
                </SingleSelectField>
                <SingleSelectField
                    dense
                    filterable
                    noMatchText={i18n.t('No match')}
                    label={i18n.t('Add a map')}
                    placeholder={i18n.t('Select a map')}
                    loading={maps.isLoading}
                    selected=""
                    onChange={({ selected }) => {
                        const entry = maps.data?.find((e) => e.key === selected)
                        if (entry) dispatch(actions.addMap(toMapItem(entry, count)))
                    }}
                >
                    {(maps.data ?? []).map((entry) => (
                        <SingleSelectOption
                            key={entry.key}
                            value={entry.key}
                            disabled={inDashboard.has(entry.key)}
                            label={`${entry.value.mapName} (${mapTypeLabel(entry.value.mapType)})`}
                        />
                    ))}
                </SingleSelectField>
                <Button onClick={() => setPickingDhis2(true)}>{i18n.t('Add from DHIS2')}</Button>
            </div>
            {pickingDhis2 && (
                <Dhis2ObjectPickerModal
                    isAdded={(dataSourceId, summary) =>
                        inDashboard.has(dhis2ItemKey(dataSourceId, summary))
                    }
                    onAdd={(dataSourceId, summary) =>
                        dispatch(actions.addDhis2Item(toDhis2Item(summary, dataSourceId, count)))
                    }
                    onClose={() => setPickingDhis2(false)}
                />
            )}

            <div
                ref={canvasRef}
                className="overflow-auto"
                style={{ backgroundColor: draft.backgroundColor }}
            >
                <DashboardCanvas
                    items={items}
                    backgroundColor={draft.backgroundColor}
                    editable={!fullscreen.isFullscreen}
                    onLayoutChange={onLayoutChange}
                    onRemove={onRemove}
                />
            </div>
        </div>
    )
}
