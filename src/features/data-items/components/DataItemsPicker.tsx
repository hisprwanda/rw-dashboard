import i18n from '@dhis2/d2-i18n'
import { NoticeBox, SingleSelectField, SingleSelectOption, Transfer } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectionActions } from '@/features/analytics'
import { useDebouncedValue } from '@/shared/hooks'
import { DATA_ITEM_TYPES, DATA_SET_METRICS } from '../constants/dataItemTypes'
import { dataItemGroupLabel, dataItemTypeLabel, dataSetMetricLabel } from '../utils/labels'
import { useDataItemGroups } from '../hooks/useDataItemGroups'
import { useDataItems } from '../hooks/useDataItems'
import type {
    DataItemsFilters,
    DataItemTypeValue,
    DataSetMetric,
    Disaggregation,
    PickerOption,
} from '../types/dataItem.types'
import { toPickerOptions, uniqueOptions } from '../utils/pickerOptions'

const ALL = '__all__'

/**
 * Pick data items (dx) for the builder: type, group and search filters on the left,
 * the ordered selection on the right. Reads and writes the Redux `selection` slice, so
 * the visualizer, map and report builders can all embed it.
 */
export const DataItemsPicker = () => {
    const dispatch = useAppDispatch()
    const { dataSource, dimensionItemType, dimensions, selectedDataItems } = useAppSelector(
        (state) => state.selection
    )
    const type: DataItemTypeValue =
        DATA_ITEM_TYPES.find((option) => option.value === dimensionItemType.value)?.value ??
        'dataItems'

    const [search, setSearch] = useState('')
    const [groupId, setGroupId] = useState('')
    const [disaggregation, setDisaggregation] = useState<Disaggregation>('totals')
    const [metric, setMetric] = useState<DataSetMetric | ''>('')
    const debouncedSearch = useDebouncedValue(search)

    const filters = useMemo<DataItemsFilters>(
        () => ({ type, search: debouncedSearch, groupId, disaggregation, metric }),
        [type, debouncedSearch, groupId, disaggregation, metric]
    )
    const items = useDataItems(dataSource, filters)
    const groups = useDataItemGroups(dataSource, type)

    const selected = useMemo(() => dimensions.dx ?? [], [dimensions.dx])
    const options = useMemo(
        () => uniqueOptions(toPickerOptions(items.items, filters)),
        [items.items, filters]
    )
    const selectedLookup = useMemo(
        () =>
            Object.fromEntries(
                selectedDataItems.map((item) => [item.id, { label: item.label, value: item.id }])
            ),
        [selectedDataItems]
    )

    const onChange = ({ selected: next }: { selected: string[] }) => {
        const labelOf = (id: string) =>
            options.find((option: PickerOption) => option.value === id)?.label ??
            selectedLookup[id]?.label ??
            id
        dispatch(selectionActions.setDimensions({ ...dimensions, dx: next }))
        dispatch(
            selectionActions.setSelectedDataItems(next.map((id) => ({ id, label: labelOf(id) })))
        )
    }

    const changeType = (value: string) => {
        const option = DATA_ITEM_TYPES.find((candidate) => candidate.value === value)
        if (!option) return
        dispatch(selectionActions.setDimensionItemType(option))
        setGroupId('')
        setMetric('')
        setDisaggregation('totals')
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <SingleSelectField
                    label={i18n.t('Data type')}
                    selected={type}
                    onChange={({ selected: value }) => changeType(value)}
                >
                    {DATA_ITEM_TYPES.map((option) => (
                        <SingleSelectOption
                            key={option.value}
                            label={dataItemTypeLabel(option.value)}
                            value={option.value}
                        />
                    ))}
                </SingleSelectField>

                {dataItemGroupLabel(type) && (
                    <SingleSelectField
                        label={dataItemGroupLabel(type)}
                        selected={groupId || ALL}
                        loading={groups.isLoading}
                        filterable
                        noMatchText={i18n.t('No match found')}
                        onChange={({ selected: value }) => setGroupId(value === ALL ? '' : value)}
                    >
                        {[{ id: ALL, name: i18n.t('All') }, ...(groups.data ?? [])].map((group) => (
                            <SingleSelectOption
                                key={group.id}
                                label={group.name}
                                value={group.id}
                            />
                        ))}
                    </SingleSelectField>
                )}

                {type === 'dataElements' && (
                    <SingleSelectField
                        label={i18n.t('Disaggregation')}
                        selected={disaggregation}
                        onChange={({ selected: value }) =>
                            setDisaggregation(value === 'details' ? 'details' : 'totals')
                        }
                    >
                        <SingleSelectOption label={i18n.t('Totals only')} value="totals" />
                        <SingleSelectOption label={i18n.t('Details only')} value="details" />
                    </SingleSelectField>
                )}

                {type === 'dataSets' && (
                    <SingleSelectField
                        label={i18n.t('Metric')}
                        selected={metric || ALL}
                        onChange={({ selected: value }) =>
                            setMetric(DATA_SET_METRICS.find((m) => m.value === value)?.value ?? '')
                        }
                    >
                        {[{ label: i18n.t('All metrics'), value: ALL }, ...DATA_SET_METRICS].map(
                            (option) => (
                                <SingleSelectOption
                                    key={option.value}
                                    label={
                                        option.value === ALL
                                            ? option.label
                                            : dataSetMetricLabel(option.value)
                                    }
                                    value={option.value}
                                />
                            )
                        )}
                    </SingleSelectField>
                )}
            </div>

            {items.error ? (
                <NoticeBox error title={i18n.t('Could not load data items')}>
                    {items.error.message}
                </NoticeBox>
            ) : (
                <Transfer
                    options={options}
                    selected={selected}
                    selectedOptionsLookup={selectedLookup}
                    onChange={onChange}
                    filterable
                    searchTerm={search}
                    onFilterChange={({ value }) => setSearch(value ?? '')}
                    filterCallback={(all) => all}
                    filterPlaceholder={i18n.t('Search data items')}
                    leftHeader={
                        <p className="px-2 py-1 text-sm font-medium">{i18n.t('Available items')}</p>
                    }
                    rightHeader={
                        <p className="px-2 py-1 text-sm font-medium">{i18n.t('Selected items')}</p>
                    }
                    selectedEmptyComponent={
                        <p className="p-2 text-sm text-gray-500">{i18n.t('No items selected')}</p>
                    }
                    sourceEmptyPlaceholder={
                        <p className="p-2 text-sm text-gray-500">
                            {items.isFetching ? i18n.t('Loading…') : i18n.t('No items found')}
                        </p>
                    }
                    loading={items.isFetching}
                    onEndReached={() => {
                        if (items.hasNextPage && !items.isFetchingNextPage)
                            void items.fetchNextPage()
                    }}
                    enableOrderChange
                    height="380px"
                />
            )}
        </div>
    )
}
