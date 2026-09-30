import i18n from '@dhis2/d2-i18n'
import { InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useState } from 'react'
import { useUserLocale } from '@/features/auth'
import { fixedPeriodOptions, useSystemCalendar, type PeriodType } from '@/features/periods'

interface IssuePeriodSelectProps {
    periodType: string
    value: string
    onChange: (periodId: string) => void
}

const yearOf = (periodId: string) => Number(periodId.slice(0, 4)) || new Date().getFullYear()

/** Year + period of the bulletin's period type. */
export const IssuePeriodSelect = ({ periodType, value, onChange }: IssuePeriodSelectProps) => {
    const calendar = useSystemCalendar()
    const locale = useUserLocale()
    const [year, setYear] = useState(() => yearOf(value))
    let options: Array<{ value: string; label: string }> = []
    try {
        options = fixedPeriodOptions(year, periodType as PeriodType, calendar, locale)
    } catch {
        options = []
    }
    const known = options.some((option) => option.value === value)
    return (
        <div className="flex items-end gap-2">
            <InputField
                dense
                type="number"
                inputWidth="90px"
                label={i18n.t('Year')}
                value={String(year)}
                onChange={({ value: next }) => setYear(Number(next) || year)}
            />
            <div className="w-72">
                <SingleSelectField
                    dense
                    filterable
                    noMatchText={i18n.t('No match')}
                    label={i18n.t('Period')}
                    selected={known ? value : undefined}
                    onChange={({ selected }) => onChange(selected)}
                >
                    {options.map((option) => (
                        <SingleSelectOption
                            key={option.value}
                            value={option.value}
                            label={option.label}
                        />
                    ))}
                </SingleSelectField>
            </div>
        </div>
    )
}
