import i18n from '@dhis2/d2-i18n'
import { Checkbox, CircularLoader, Radio, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { useLegendSet, useLegendSets } from '../hooks/useLegendSets'
import { mapBuilderActions as actions } from '../store/mapBuilderSlice'
import type { MapLabelKind } from '../types/map.types'

const labelOptions = (): Array<{ kind: MapLabelKind; label: string }> => [
    { kind: 'area', label: i18n.t('Area name') },
    { kind: 'data', label: i18n.t('Data name') },
    { kind: 'period', label: i18n.t('Period') },
    { kind: 'value', label: i18n.t('Value') },
]

/** Labels on the areas and the legend (automatic or a DHIS2 legend set). */
export const StyleOptions = () => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector((state) => state.mapBuilder.settings)
    const useDhis2Legend = settings.legendType === 'dhis2'
    const legendSets = useLegendSets(useDhis2Legend)
    const [legendSetId, setLegendSetId] = useState<string>()
    const legendSet = useLegendSet(legendSetId)

    // Default to the first legend set, then keep the store in sync with the picked one.
    useEffect(() => {
        if (useDhis2Legend && !legendSetId && legendSets.data?.[0]) {
            setLegendSetId(legendSets.data[0].id)
        }
    }, [useDhis2Legend, legendSetId, legendSets.data])
    useEffect(() => {
        if (legendSet.data) {
            dispatch(
                actions.setLegendSet({
                    name: legendSet.data.displayName ?? legendSet.data.name ?? '',
                    legends: legendSet.data.legends.map(
                        ({ name, startValue, endValue, color }) => ({
                            name: name ?? '',
                            startValue,
                            endValue,
                            color,
                        })
                    ),
                })
            )
        }
    }, [legendSet.data, dispatch])

    const toggleLabel = (kind: MapLabelKind, checked: boolean) => {
        const labels = labelOptions()
            .map((option) => option.kind)
            .filter((k) => (k === kind ? checked : settings.appliedLabels.includes(k)))
        dispatch(actions.setLabels(labels))
    }

    return (
        <div className="grid grid-cols-2 gap-6">
            <section>
                <h4 className="mb-2 mt-0 text-sm font-semibold">{i18n.t('Labels')}</h4>
                {labelOptions().map(({ kind, label }) => (
                    <Checkbox
                        key={kind}
                        dense
                        label={label}
                        checked={settings.appliedLabels.includes(kind)}
                        onChange={({ checked }) => toggleLabel(kind, checked)}
                    />
                ))}
            </section>
            <section>
                <h4 className="mb-2 mt-0 text-sm font-semibold">{i18n.t('Legend')}</h4>
                <Radio
                    dense
                    label={i18n.t('Automatic (5 classes)')}
                    checked={!useDhis2Legend}
                    onChange={() => dispatch(actions.setLegendType('auto'))}
                />
                <Radio
                    dense
                    label={i18n.t('Legend set')}
                    checked={useDhis2Legend}
                    onChange={() => dispatch(actions.setLegendType('dhis2'))}
                />
                {useDhis2Legend && (
                    <div className="mt-2">
                        <SingleSelectField
                            dense
                            label={i18n.t('Legend set')}
                            loading={legendSets.isLoading}
                            error={!!legendSets.error}
                            validationText={
                                legendSets.error
                                    ? i18n.t('Could not load the legend sets.')
                                    : undefined
                            }
                            selected={legendSetId}
                            onChange={({ selected }) => setLegendSetId(selected)}
                        >
                            {(legendSets.data ?? []).map((set) => (
                                <SingleSelectOption
                                    key={set.id}
                                    value={set.id}
                                    label={set.displayName ?? set.name ?? set.id}
                                />
                            ))}
                        </SingleSelectField>
                        {legendSet.isFetching && <CircularLoader extrasmall />}
                    </div>
                )}
            </section>
        </div>
    )
}
