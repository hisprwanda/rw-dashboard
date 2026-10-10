import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectionActions } from '@/features/analytics'
import { CURRENT_INSTANCE_ID, useDataSources } from '@/features/data-sources'
import { useApplicationTitle } from '@/features/system'

interface AdditionalSourcesSectionProps {
    /** Opens the data items of an additional source. */
    onOpen: (dataSourceId: string) => void
    /** Called after a source was removed (the previous result no longer applies). */
    onRemove: () => void
}

/** Data items from other data sources than the main one, combined in the same visual. */
export const AdditionalSourcesSection = ({ onOpen, onRemove }: AdditionalSourcesSectionProps) => {
    const dispatch = useAppDispatch()
    const applicationTitle = useApplicationTitle()
    const { data: sources = [], isLoading } = useDataSources()
    const mainId = useAppSelector((state) => state.selection.dataSourceId)
    const added = useAppSelector((state) => state.selection.additionalSources)

    const candidates = [
        {
            key: CURRENT_INSTANCE_ID,
            value: { isCurrentInstance: true, instanceName: applicationTitle },
        },
        ...sources,
    ].filter(({ key }) => key !== mainId && !added.some(({ dataSourceId }) => dataSourceId === key))

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
                {i18n.t('Data from other sources')}
            </span>
            {added.map(({ dataSourceId, dataSource, items }) => (
                <div key={dataSourceId} className="flex items-center gap-1">
                    <div className="flex-grow">
                        <Button small secondary onClick={() => onOpen(dataSourceId)}>
                            {items.length
                                ? `${dataSource.instanceName} (${items.length})`
                                : dataSource.instanceName}
                        </Button>
                    </div>
                    <Button
                        small
                        secondary
                        icon={<IconCross16 />}
                        aria-label={i18n.t('Remove')}
                        title={i18n.t('Remove')}
                        onClick={() => {
                            dispatch(selectionActions.removeSource(dataSourceId))
                            onRemove()
                        }}
                    />
                </div>
            ))}
            {candidates.length > 0 && (
                <SingleSelectField
                    dense
                    loading={isLoading}
                    placeholder={i18n.t('Add a data source')}
                    selected=""
                    onChange={({ selected }) => {
                        const source = candidates.find(({ key }) => key === selected)
                        if (!source) return
                        dispatch(
                            selectionActions.addSource({
                                id: source.key,
                                dataSource: source.value,
                            })
                        )
                        onOpen(source.key)
                    }}
                >
                    {candidates.map(({ key, value }) => (
                        <SingleSelectOption key={key} value={key} label={value.instanceName} />
                    ))}
                </SingleSelectField>
            )}
        </div>
    )
}
