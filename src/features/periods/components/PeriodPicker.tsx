import i18n from '@dhis2/d2-i18n'
import { InputField, SingleSelectField, SingleSelectOption, Tab, TabBar, Transfer } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectionActions } from '@/features/analytics'
import {
    BULLETIN_PERIOD_TYPES,
    FIXED_PERIOD_TYPES,
    RELATIVE_PERIOD_GROUPS,
    type PeriodType,
    type RelativePeriodGroup,
} from '../constants/periods'
import { useSystemCalendar } from '../hooks/useSystemCalendar'
import { periodTypeLabel, relativeGroupLabel } from '../utils/labels'
import { fixedPeriodOptions, periodLabel, relativePeriodOptions } from '../utils/periodOptions'

interface PeriodPickerProps {
    /** Weekly bulletins: one fixed weekly/bi-weekly period only. */
    bulletinMode?: boolean
}

const GROUPS = Object.keys(RELATIVE_PERIOD_GROUPS) as RelativePeriodGroup[]

/** Pick relative and/or fixed periods (pe). Reads and writes the Redux `selection` slice. */
export const PeriodPicker = ({ bulletinMode = false }: PeriodPickerProps) => {
    const dispatch = useAppDispatch()
    const dimensions = useAppSelector((state) => state.selection.dimensions)
    const calendar = useSystemCalendar()
    const locale = i18n.language || 'en'

    const [tab, setTab] = useState<'relative' | 'fixed'>(bulletinMode ? 'fixed' : 'relative')
    const [group, setGroup] = useState<RelativePeriodGroup>('months')
    const [periodType, setPeriodType] = useState<PeriodType>(bulletinMode ? 'WEEKLY' : 'MONTHLY')
    const [year, setYear] = useState(new Date().getFullYear())

    const periodTypes = bulletinMode
        ? FIXED_PERIOD_TYPES.filter((type) => BULLETIN_PERIOD_TYPES.includes(type))
        : FIXED_PERIOD_TYPES

    const options = useMemo(
        () =>
            tab === 'relative'
                ? relativePeriodOptions(group)
                : fixedPeriodOptions(year, periodType, calendar, locale),
        [tab, group, year, periodType, calendar, locale]
    )
    const selected = useMemo(() => dimensions.pe ?? [], [dimensions.pe])
    const selectedLookup = useMemo(
        () =>
            Object.fromEntries(
                selected.map((id) => [id, { value: id, label: periodLabel(id, calendar, locale) }])
            ),
        [selected, calendar, locale]
    )

    const onChange = ({ selected: next }: { selected: string[] }) =>
        dispatch(
            selectionActions.setDimensions({
                ...dimensions,
                pe: bulletinMode ? next.slice(-1) : next,
            })
        )

    return (
        <div className="flex flex-col gap-3">
            {!bulletinMode && (
                <TabBar>
                    <Tab selected={tab === 'relative'} onClick={() => setTab('relative')}>
                        {i18n.t('Relative periods')}
                    </Tab>
                    <Tab selected={tab === 'fixed'} onClick={() => setTab('fixed')}>
                        {i18n.t('Fixed periods')}
                    </Tab>
                </TabBar>
            )}

            {tab === 'relative' ? (
                <div className="max-w-xs">
                    <SingleSelectField
                        label={i18n.t('Period group')}
                        selected={group}
                        onChange={({ selected: value }) => setGroup(value as RelativePeriodGroup)}
                    >
                        {GROUPS.map((key) => (
                            <SingleSelectOption
                                key={key}
                                value={key}
                                label={relativeGroupLabel(key)}
                            />
                        ))}
                    </SingleSelectField>
                </div>
            ) : (
                <div className="flex flex-wrap gap-3">
                    <div className="min-w-[16rem]">
                        <SingleSelectField
                            label={i18n.t('Period type')}
                            selected={periodType}
                            onChange={({ selected: value }) =>
                                setPeriodType(
                                    periodTypes.find((type) => type === value) ?? periodType
                                )
                            }
                        >
                            {periodTypes.map((type) => (
                                <SingleSelectOption
                                    key={type}
                                    value={type}
                                    label={periodTypeLabel(type)}
                                />
                            ))}
                        </SingleSelectField>
                    </div>
                    <div className="w-32">
                        <InputField
                            name="year"
                            label={i18n.t('Year')}
                            type="number"
                            value={String(year)}
                            onChange={({ value }) => {
                                const parsed = Number(value)
                                if (Number.isInteger(parsed) && parsed > 1900 && parsed < 2200)
                                    setYear(parsed)
                            }}
                        />
                    </div>
                </div>
            )}

            <Transfer
                options={options}
                selected={selected}
                selectedOptionsLookup={selectedLookup}
                onChange={onChange}
                maxSelections={bulletinMode ? 1 : Infinity}
                enableOrderChange={!bulletinMode}
                leftHeader={
                    <p className="px-2 py-1 text-sm font-medium">{i18n.t('Available periods')}</p>
                }
                rightHeader={
                    <p className="px-2 py-1 text-sm font-medium">{i18n.t('Selected periods')}</p>
                }
                selectedEmptyComponent={
                    <p className="p-2 text-sm text-gray-500">{i18n.t('No periods selected')}</p>
                }
                height="340px"
            />
        </div>
    )
}
