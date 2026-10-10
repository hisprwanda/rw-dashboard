import { colorSets } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Checkbox,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Radio,
    SingleSelectField,
    SingleSelectOption,
    Tab,
    TabBar,
} from '@dhis2/ui'
import { useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { useChartLegendSets } from '@/features/analytics'
import { supportsLegendSet, visTypeFromChartType } from '../utils/visualization'
import { visualizerActions } from '../store/visualizerSlice'
import {
    DEFAULT_OUTLIER_OPTIONS,
    MAX_OUTLIER_RESULTS,
    orderByOptions,
    withAlgorithm,
    type OutlierAlgorithm,
    type OutlierOptions,
} from '../utils/outliers'
import { DEFAULT_PIVOT_TABLE_OPTIONS } from '../utils/visualizerOptions'
import type {
    HideEmptyRowItems,
    PivotTableOptions,
    ReferenceLine,
    RegressionType,
    VisualizerOptions,
} from '../types/visualization.types'

type Tab = 'data' | 'axes' | 'legend' | 'style'

interface OptionsModalProps {
    onClose: () => void
}

const Group = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-2 border-b border-gray-200 pb-3">
        <h4 className="m-0 text-sm font-semibold text-gray-700">{title}</h4>
        {children}
    </section>
)

const parseNumber = (value: string | undefined) =>
    value === undefined || value.trim() === '' || Number.isNaN(Number(value))
        ? undefined
        : Number(value)

const colorSetLabel = (key: string) => {
    const labels: Record<string, string> = {
        DEFAULT: i18n.t('Default'),
        BASIC: i18n.t('Basic'),
        EXTENDED: i18n.t('Extended'),
        BRIGHT: i18n.t('Bright'),
        DARK: i18n.t('Dark'),
        GRAY: i18n.t('Gray'),
        COLOR_BLIND: i18n.t('Color blind'),
    }
    return labels[key] ?? key
}

const outlierColumnLabel = (key: string) => {
    const labels: Record<string, string> = {
        absdev: i18n.t('Absolute deviation'),
        zscore: i18n.t('Z-score'),
        modifiedzscore: i18n.t('Modified z-score'),
        mean: i18n.t('Mean'),
        median: i18n.t('Median'),
        stddev: i18n.t('Standard deviation'),
        medianabsdeviation: i18n.t('Median absolute deviation'),
        lowerbound: i18n.t('Lower boundary'),
        upperbound: i18n.t('Upper boundary'),
    }
    return labels[key] ?? key
}

/** The chart options of the official Data Visualizer: Data, Axes, Legend and Style tabs. */
export const OptionsModal = ({ onClose }: OptionsModalProps) => {
    const dispatch = useAppDispatch()
    const options = useAppSelector((state) => state.visualizer.options)
    const chartType = useAppSelector((state) => state.visualizer.chartType)
    const dataSource = useAppSelector((state) => state.selection.dataSource)
    const legendSets = useChartLegendSets(dataSource)
    const visType = visTypeFromChartType(chartType)
    const [tab, setTab] = useState<Tab>('data')
    const update = (patch: Partial<VisualizerOptions>) =>
        dispatch(visualizerActions.updateOptions(patch))
    const isPivot = visType === 'PIVOT_TABLE'
    const pivot = { ...DEFAULT_PIVOT_TABLE_OPTIONS, ...options.pivot }
    const updatePivot = (patch: Partial<PivotTableOptions>) =>
        update({ pivot: { ...pivot, ...patch } })
    const pivotCheck = (
        key: {
            [K in keyof PivotTableOptions]: PivotTableOptions[K] extends boolean ? K : never
        }[keyof PivotTableOptions],
        label: string
    ) => (
        <Checkbox
            dense
            label={label}
            checked={pivot[key]}
            onChange={({ checked }) => updatePivot({ [key]: checked })}
        />
    )

    const outlier = { ...DEFAULT_OUTLIER_OPTIONS, ...options.outlier }
    const updateOutlier = (next: OutlierOptions) => update({ outlier: next })
    const outlierOptions = (
        <>
            <Group title={i18n.t('Outlier detection method')}>
                <SingleSelectField
                    dense
                    label={i18n.t('Method')}
                    selected={outlier.algorithm}
                    onChange={({ selected }) =>
                        updateOutlier(withAlgorithm(outlier, selected as OutlierAlgorithm))
                    }
                >
                    <SingleSelectOption
                        value="MODIFIED_Z_SCORE"
                        label={i18n.t('Modified z-score')}
                    />
                    <SingleSelectOption value="Z_SCORE" label={i18n.t('Z-score')} />
                </SingleSelectField>
                <InputField
                    dense
                    type="number"
                    min="0.1"
                    step="0.1"
                    label={i18n.t('Threshold factor')}
                    helpText={i18n.t(
                        'Values further than this many scores from the center are outliers.'
                    )}
                    value={String(outlier.threshold)}
                    onChange={({ value }) =>
                        updateOutlier({
                            ...outlier,
                            threshold: parseNumber(value) ?? DEFAULT_OUTLIER_OPTIONS.threshold,
                        })
                    }
                />
            </Group>
            <Group title={i18n.t('Results')}>
                <InputField
                    dense
                    type="number"
                    min="1"
                    max={String(MAX_OUTLIER_RESULTS)}
                    label={i18n.t('Maximum number of results')}
                    value={String(outlier.maxResults)}
                    onChange={({ value }) =>
                        updateOutlier({
                            ...outlier,
                            maxResults: parseNumber(value) ?? DEFAULT_OUTLIER_OPTIONS.maxResults,
                        })
                    }
                />
                <SingleSelectField
                    dense
                    label={i18n.t('Sort by')}
                    selected={outlier.orderBy}
                    onChange={({ selected }) => updateOutlier({ ...outlier, orderBy: selected })}
                >
                    {orderByOptions(outlier.algorithm).map((key) => (
                        <SingleSelectOption key={key} value={key} label={outlierColumnLabel(key)} />
                    ))}
                </SingleSelectField>
                <SingleSelectField
                    dense
                    label={i18n.t('Sort order')}
                    selected={outlier.sortOrder}
                    onChange={({ selected }) =>
                        updateOutlier({
                            ...outlier,
                            sortOrder: selected === 'ASC' ? 'ASC' : 'DESC',
                        })
                    }
                >
                    <SingleSelectOption value="DESC" label={i18n.t('High to low')} />
                    <SingleSelectOption value="ASC" label={i18n.t('Low to high')} />
                </SingleSelectField>
            </Group>
        </>
    )

    const pivotTabs: Partial<Record<Tab, ReactNode>> = {
        data: (
            <>
                <Group title={i18n.t('Totals')}>
                    {pivotCheck('colTotals', i18n.t('Columns totals'))}
                    {pivotCheck('colSubTotals', i18n.t('Columns sub-totals'))}
                    {pivotCheck('rowTotals', i18n.t('Rows totals'))}
                    {pivotCheck('rowSubTotals', i18n.t('Rows sub-totals'))}
                </Group>
                <Group title={i18n.t('Empty data')}>
                    {pivotCheck('hideEmptyColumns', i18n.t('Hide empty columns'))}
                    {pivotCheck('hideEmptyRows', i18n.t('Hide empty rows'))}
                </Group>
                <Group title={i18n.t('Display')}>
                    <SingleSelectField
                        dense
                        label={i18n.t('Number type')}
                        selected={pivot.numberType}
                        onChange={({ selected }) =>
                            updatePivot({ numberType: selected as PivotTableOptions['numberType'] })
                        }
                    >
                        <SingleSelectOption value="VALUE" label={i18n.t('Value')} />
                        <SingleSelectOption
                            value="ROW_PERCENTAGE"
                            label={i18n.t('Percentage of row')}
                        />
                        <SingleSelectOption
                            value="COLUMN_PERCENTAGE"
                            label={i18n.t('Percentage of column')}
                        />
                    </SingleSelectField>
                </Group>
            </>
        ),
        style: (
            <>
                <Group title={i18n.t('Table')}>
                    <SingleSelectField
                        dense
                        label={i18n.t('Display density')}
                        selected={pivot.displayDensity}
                        onChange={({ selected }) =>
                            updatePivot({
                                displayDensity: selected as PivotTableOptions['displayDensity'],
                            })
                        }
                    >
                        <SingleSelectOption value="COMFORTABLE" label={i18n.t('Comfortable')} />
                        <SingleSelectOption value="NORMAL" label={i18n.t('Normal')} />
                        <SingleSelectOption value="COMPACT" label={i18n.t('Compact')} />
                    </SingleSelectField>
                    <SingleSelectField
                        dense
                        label={i18n.t('Font size')}
                        selected={pivot.fontSize}
                        onChange={({ selected }) =>
                            updatePivot({ fontSize: selected as PivotTableOptions['fontSize'] })
                        }
                    >
                        <SingleSelectOption value="LARGE" label={i18n.t('Large')} />
                        <SingleSelectOption value="NORMAL" label={i18n.t('Normal')} />
                        <SingleSelectOption value="SMALL" label={i18n.t('Small')} />
                    </SingleSelectField>
                </Group>
                <Group title={i18n.t('Labels')}>
                    {pivotCheck('showDimensionLabels', i18n.t('Show dimension labels'))}
                    {pivotCheck('showHierarchy', i18n.t('Show organisation unit hierarchy'))}
                </Group>
                <Group title={i18n.t('Headers')}>
                    {pivotCheck('fixColumnHeaders', i18n.t('Keep column headers visible'))}
                    {pivotCheck('fixRowHeaders', i18n.t('Keep row headers visible'))}
                </Group>
            </>
        ),
    }

    const check = (key: keyof VisualizerOptions, label: string) => (
        <Checkbox
            dense
            label={label}
            checked={options[key] as boolean}
            onChange={({ checked }) => update({ [key]: checked })}
        />
    )

    const referenceLine = (key: 'baseLine' | 'targetLine', title: string) => {
        const line = options[key]
        const change = (patch: Partial<ReferenceLine>) => update({ [key]: { ...line, ...patch } })
        return (
            <Group title={title}>
                <Checkbox
                    dense
                    label={i18n.t('Show line')}
                    checked={line.enabled}
                    onChange={({ checked }) => change({ enabled: checked })}
                />
                {line.enabled && (
                    <div className="flex gap-3">
                        <InputField
                            dense
                            type="number"
                            label={i18n.t('Value')}
                            value={line.value === undefined ? '' : String(line.value)}
                            onChange={({ value }) => change({ value: parseNumber(value) })}
                        />
                        <InputField
                            dense
                            label={i18n.t('Title')}
                            value={line.title ?? ''}
                            onChange={({ value }) => change({ title: value ?? '' })}
                        />
                    </div>
                )}
            </Group>
        )
    }

    const tabs: Record<Tab, ReactNode> = {
        data: (
            <>
                <Group title={i18n.t('Values')}>
                    {check('showData', i18n.t('Show values'))}
                    {check('cumulativeValues', i18n.t('Use cumulative values'))}
                    {check('percentStackedValues', i18n.t('Use 100% stacked values'))}
                </Group>
                <Group title={i18n.t('Empty categories')}>
                    <SingleSelectField
                        dense
                        label={i18n.t('Hide empty categories')}
                        selected={options.hideEmptyRowItems}
                        onChange={({ selected }) =>
                            update({ hideEmptyRowItems: selected as HideEmptyRowItems })
                        }
                    >
                        <SingleSelectOption value="NONE" label={i18n.t('None')} />
                        <SingleSelectOption
                            value="BEFORE_FIRST"
                            label={i18n.t('Before first value')}
                        />
                        <SingleSelectOption value="AFTER_LAST" label={i18n.t('After last value')} />
                        <SingleSelectOption
                            value="BEFORE_FIRST_AFTER_LAST"
                            label={i18n.t('Before first and after last value')}
                        />
                        <SingleSelectOption value="ALL" label={i18n.t('All empty')} />
                    </SingleSelectField>
                </Group>
                <Group title={i18n.t('Sort order')}>
                    <SingleSelectField
                        dense
                        selected={String(options.sortOrder)}
                        onChange={({ selected }) =>
                            update({
                                sortOrder: Number(selected) as VisualizerOptions['sortOrder'],
                            })
                        }
                    >
                        <SingleSelectOption value="0" label={i18n.t('Default')} />
                        <SingleSelectOption value="-1" label={i18n.t('Low to high')} />
                        <SingleSelectOption value="1" label={i18n.t('High to low')} />
                    </SingleSelectField>
                </Group>
            </>
        ),
        axes: (
            <>
                <Group title={i18n.t('Vertical (y) axis')}>
                    <div className="flex gap-3">
                        <InputField
                            dense
                            type="number"
                            label={i18n.t('Minimum')}
                            value={
                                options.rangeAxisMin === undefined
                                    ? ''
                                    : String(options.rangeAxisMin)
                            }
                            onChange={({ value }) => update({ rangeAxisMin: parseNumber(value) })}
                        />
                        <InputField
                            dense
                            type="number"
                            label={i18n.t('Maximum')}
                            value={
                                options.rangeAxisMax === undefined
                                    ? ''
                                    : String(options.rangeAxisMax)
                            }
                            onChange={({ value }) => update({ rangeAxisMax: parseNumber(value) })}
                        />
                        <InputField
                            dense
                            type="number"
                            min="1"
                            label={i18n.t('Tick steps')}
                            value={
                                options.rangeAxisSteps === undefined
                                    ? ''
                                    : String(options.rangeAxisSteps)
                            }
                            onChange={({ value }) => update({ rangeAxisSteps: parseNumber(value) })}
                        />
                    </div>
                    <InputField
                        dense
                        label={i18n.t('Axis title')}
                        value={options.rangeAxisTitle ?? ''}
                        onChange={({ value }) => update({ rangeAxisTitle: value ?? '' })}
                    />
                </Group>
                {referenceLine('targetLine', i18n.t('Target line'))}
                {referenceLine('baseLine', i18n.t('Base line'))}
                <Group title={i18n.t('Trend line')}>
                    <SingleSelectField
                        dense
                        selected={options.regressionType}
                        onChange={({ selected }) =>
                            update({ regressionType: selected as RegressionType })
                        }
                    >
                        <SingleSelectOption value="NONE" label={i18n.t('None')} />
                        <SingleSelectOption value="LINEAR" label={i18n.t('Linear')} />
                        <SingleSelectOption value="POLYNOMIAL" label={i18n.t('Polynomial')} />
                        <SingleSelectOption value="LOESS" label={i18n.t('Loess')} />
                    </SingleSelectField>
                </Group>
            </>
        ),
        legend: (
            <>
                {!isPivot && (
                    <Group title={i18n.t('Series key')}>
                        {check('hideLegend', i18n.t('Hide the legend'))}
                    </Group>
                )}
                {visType && supportsLegendSet(visType) && (
                    <Group title={i18n.t('Legend set')}>
                        <SingleSelectField
                            dense
                            clearable
                            clearText={i18n.t('No legend set')}
                            placeholder={i18n.t('No legend set')}
                            loading={legendSets.isLoading}
                            selected={options.legendSetId ?? ''}
                            onChange={({ selected }) =>
                                update({ legendSetId: selected || undefined })
                            }
                        >
                            {(legendSets.data ?? []).map(({ id, name }) => (
                                <SingleSelectOption key={id} value={id} label={name} />
                            ))}
                        </SingleSelectField>
                        {options.legendSetId && (
                            <div className="flex gap-4">
                                <Radio
                                    dense
                                    label={
                                        isPivot
                                            ? i18n.t('Color the cells')
                                            : i18n.t('Color the bars')
                                    }
                                    checked={options.legendStyle === 'FILL'}
                                    onChange={() => update({ legendStyle: 'FILL' })}
                                />
                                <Radio
                                    dense
                                    label={i18n.t('Color the text')}
                                    checked={options.legendStyle === 'TEXT'}
                                    onChange={() => update({ legendStyle: 'TEXT' })}
                                />
                            </div>
                        )}
                    </Group>
                )}
            </>
        ),
        style: (
            <>
                <Group title={i18n.t('Color set')}>
                    {Object.entries(colorSets)
                        .filter(([, set]) => set.colors)
                        .map(([key, set]) => (
                            <div key={key} className="flex items-center gap-3">
                                <Radio
                                    dense
                                    label={colorSetLabel(key)}
                                    checked={options.colorSet === key}
                                    onChange={() => update({ colorSet: key })}
                                />
                                <span className="flex">
                                    {set.colors
                                        ?.slice(0, 8)
                                        .map((color) => (
                                            <span
                                                key={color}
                                                className="h-3 w-5"
                                                style={{ background: color }}
                                            />
                                        ))}
                                </span>
                            </div>
                        ))}
                </Group>
                <Group title={i18n.t('Columns')}>
                    {check('noSpaceBetweenColumns', i18n.t('No space between columns'))}
                </Group>
            </>
        ),
    }

    return (
        <Modal onClose={onClose} position="middle" large>
            <ModalTitle>{i18n.t('Options')}</ModalTitle>
            <ModalContent>
                {visType === 'OUTLIER_TABLE' ? (
                    <div className="flex flex-col gap-3">{outlierOptions}</div>
                ) : (
                    <>
                        <TabBar>
                            <Tab selected={tab === 'data'} onClick={() => setTab('data')}>
                                {i18n.t('Data')}
                            </Tab>
                            {!isPivot && (
                                <Tab selected={tab === 'axes'} onClick={() => setTab('axes')}>
                                    {i18n.t('Axes')}
                                </Tab>
                            )}
                            <Tab selected={tab === 'legend'} onClick={() => setTab('legend')}>
                                {i18n.t('Legend')}
                            </Tab>
                            <Tab selected={tab === 'style'} onClick={() => setTab('style')}>
                                {i18n.t('Style')}
                            </Tab>
                        </TabBar>
                        <div className="flex min-h-[320px] flex-col gap-3 pt-3">
                            {(isPivot && pivotTabs[tab]) || tabs[tab]}
                        </div>
                    </>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button primary onClick={onClose}>
                        {i18n.t('Done')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
