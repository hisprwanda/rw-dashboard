import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import type { MetadataRef } from '../types/bulletin.types'

interface RefSelectProps {
    label: string
    options: readonly MetadataRef[] | undefined
    value: MetadataRef | null
    onChange: (value: MetadataRef | null) => void
    loading?: boolean
    error?: boolean
    required?: boolean
    helpText?: string
}

/** Pick one DHIS2 object (program, attribute, data element…) by name. */
export const RefSelect = ({
    label,
    options,
    value,
    onChange,
    loading,
    error,
    required,
    helpText,
}: RefSelectProps) => {
    // Keep the saved choice visible even if the instance no longer lists it.
    const list =
        value && !options?.some((o) => o.id === value.id)
            ? [value, ...(options ?? [])]
            : (options ?? [])
    return (
        <SingleSelectField
            dense
            filterable
            clearable={!required}
            noMatchText={i18n.t('No match')}
            label={label}
            required={required}
            loading={loading}
            error={error}
            validationText={error ? i18n.t('Could not load the list.') : undefined}
            helpText={helpText}
            selected={value?.id}
            onChange={({ selected }) => onChange(list.find((o) => o.id === selected) ?? null)}
        >
            {list.map((option) => (
                <SingleSelectOption key={option.id} value={option.id} label={option.name} />
            ))}
        </SingleSelectField>
    )
}
