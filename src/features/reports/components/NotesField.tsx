import i18n from '@dhis2/d2-i18n'
import { TextAreaField } from '@dhis2/ui'
import { useState } from 'react'

/** Free notes typed while preparing the bulletin (printed with it, not saved). */
export const NotesField = ({ label }: { label: string }) => {
    const [value, setValue] = useState('')
    return (
        <div className="my-3">
            <TextAreaField
                label={label}
                placeholder={i18n.t('Enter notes...')}
                value={value}
                onChange={({ value: next }) => setValue(next ?? '')}
            />
        </div>
    )
}
