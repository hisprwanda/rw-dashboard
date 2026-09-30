import i18n from '@dhis2/d2-i18n'
import { useEventSignals } from '../hooks/useSectionData'
import type { BulletinContext, EventSignalsSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { ItemList, SectionFrame, SectionStatus } from './SectionFrame'

/** Signals reported through an event program, grouped by code (and location). */
export const EventSignalsSectionView = ({
    section,
    context,
}: {
    section: EventSignalsSection
    context: BulletinContext
}) => {
    const { data, isLoading, error } = useEventSignals(section, context)
    return (
        <SectionFrame
            title={pickText(section.title, context.language, context.languages)}
            description={pickText(section.description, context.language, context.languages)}
        >
            <SectionStatus
                configured={!!section.program && !!section.codeElement}
                loading={isLoading}
                error={error}
            />
            {data && (
                <>
                    <p>
                        {i18n.t('{{count}} alerts from {{events}} reports.', {
                            count: data.total,
                            events: data.events,
                        })}
                    </p>
                    <ItemList
                        items={data.signals.map((signal) =>
                            i18n.t('{{count}} {{name}} reported by {{places}} org units', {
                                count: signal.count,
                                name: signal.name,
                                places: signal.orgUnits,
                            })
                        )}
                        empty={i18n.t('None reported.')}
                    />
                </>
            )}
        </SectionFrame>
    )
}
