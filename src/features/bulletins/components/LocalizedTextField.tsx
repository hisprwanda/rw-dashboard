import { InputField, TextAreaField } from '@dhis2/ui'
import type { LocalizedText } from '../types/bulletin.types'
import { withText } from '../utils/localizedText'

interface LocalizedTextFieldProps {
    label: string
    value: LocalizedText | undefined
    languages: readonly string[]
    onChange: (value: LocalizedText) => void
    multiline?: boolean
}

/** One input per content language (`Title (fr)`). */
export const LocalizedTextField = ({
    label,
    value,
    languages,
    onChange,
    multiline = false,
}: LocalizedTextFieldProps) => (
    <div className="flex flex-col gap-2">
        {languages.map((language) => {
            const fieldLabel = languages.length > 1 ? `${label} (${language})` : label
            const current = value?.[language] ?? ''
            const update = (next: string | undefined) =>
                onChange(withText(value, language, next ?? ''))
            return multiline ? (
                <TextAreaField
                    key={language}
                    dense
                    rows={4}
                    label={fieldLabel}
                    value={current}
                    onChange={({ value: next }) => update(next)}
                />
            ) : (
                <InputField
                    key={language}
                    dense
                    label={fieldLabel}
                    value={current}
                    onChange={({ value: next }) => update(next)}
                />
            )
        })}
    </div>
)
