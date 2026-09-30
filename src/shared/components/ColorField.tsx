import { Field } from '@dhis2/ui'

interface ColorFieldProps {
    label: string
    value: string
    onChange: (color: string) => void
}

/** `@dhis2/ui` has no color input: a native one inside a DHIS2 `Field`. */
export const ColorField = ({ label, value, onChange }: ColorFieldProps) => (
    <Field label={label}>
        <input
            type="color"
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
        />
    </Field>
)
