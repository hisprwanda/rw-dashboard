import i18n from '@dhis2/d2-i18n'
import { TextAreaField } from '@dhis2/ui'
import type { BulletinContext, NotesSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { SectionFrame } from './SectionFrame'

interface NotesSectionViewProps {
    section: NotesSection
    context: BulletinContext
    value: string
    /** Text printed (and shown read-only): falls back to another language when empty. */
    displayValue: string
    editable: boolean
    onChange: (value: string) => void
}

/** Free text the author writes for this issue, in the current content language. */
export const NotesSectionView = ({
    section,
    context,
    value,
    displayValue,
    editable,
    onChange,
}: NotesSectionViewProps) => (
    <SectionFrame
        title={pickText(section.title, context.language, context.languages)}
        description={pickText(section.description, context.language, context.languages)}
    >
        {editable ? (
            <div className="no-print">
                <TextAreaField
                    rows={5}
                    placeholder={i18n.t('Write the notes for this period')}
                    value={value}
                    onChange={({ value: next }) => onChange(next ?? '')}
                />
            </div>
        ) : null}
        {/* Printed / read-only text. */}
        <p className={`whitespace-pre-line ${editable ? 'print-only' : ''}`}>{displayValue}</p>
    </SectionFrame>
)
