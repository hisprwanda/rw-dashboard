import type { BulletinContext, BulletinSection, OutbreakRow } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { CompletenessSectionView } from './CompletenessSectionView'
import { CoverSectionView } from './CoverSectionView'
import { EventSignalsSectionView } from './EventSignalsSectionView'
import { IndicatorTrendsSectionView } from './IndicatorTrendsSectionView'
import { NotesSectionView } from './NotesSectionView'
import { OutbreaksSectionView } from './OutbreaksSectionView'
import { TextSectionView } from './TextSectionView'
import { TrackerCasesSectionView } from './TrackerCasesSectionView'

/** What the author writes for this issue, and how to change it. */
export interface IssueEditing {
    editable: boolean
    notes: Record<string, Record<string, string>>
    outbreaks: Record<string, OutbreakRow[]>
    onNotesChange: (sectionId: string, value: string) => void
    onOutbreaksChange: (sectionId: string, rows: OutbreakRow[]) => void
}

/** Renders any section type. */
export const BulletinSectionView = ({
    section,
    context,
    editing,
}: {
    section: BulletinSection
    context: BulletinContext
    editing: IssueEditing
}) => {
    switch (section.type) {
        case 'cover':
            return <CoverSectionView section={section} context={context} />
        case 'text':
            return <TextSectionView section={section} context={context} />
        case 'indicatorTrends':
            return <IndicatorTrendsSectionView section={section} context={context} />
        case 'trackerCases':
            return <TrackerCasesSectionView section={section} context={context} />
        case 'eventSignals':
            return <EventSignalsSectionView section={section} context={context} />
        case 'completeness':
            return <CompletenessSectionView section={section} context={context} />
        case 'outbreaks':
            return (
                <OutbreaksSectionView
                    section={section}
                    context={context}
                    rows={editing.outbreaks[section.id] ?? []}
                    editable={editing.editable}
                    onChange={(rows) => editing.onOutbreaksChange(section.id, rows)}
                />
            )
        case 'notes':
            return (
                <NotesSectionView
                    section={section}
                    context={context}
                    value={editing.notes[section.id]?.[context.language] ?? ''}
                    displayValue={pickText(
                        editing.notes[section.id],
                        context.language,
                        context.languages
                    )}
                    editable={editing.editable}
                    onChange={(value) => editing.onNotesChange(section.id, value)}
                />
            )
    }
}
