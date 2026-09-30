import i18n from '@dhis2/d2-i18n'
import { useEventSignals } from '../hooks/useSectionData'
import type { BulletinContext, EventSignalsSection } from '../types/bulletin.types'
import { orgUnitCount, reportCount } from '../utils/counts'
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
                        {i18n.t('{{count}} alert from {{reports}}.', {
                            count: data.total,
                            reports: reportCount(data.events),
                            defaultValue: '{{count}} alert from {{reports}}.',
                            defaultValue_plural: '{{count}} alerts from {{reports}}.',
                        })}
                    </p>
                    <ItemList
                        items={data.signals.map((signal) =>
                            i18n.t('{{count}} alert of {{name}} reported by {{orgUnits}}', {
                                count: signal.count,
                                name: signal.name,
                                orgUnits: orgUnitCount(signal.orgUnits),
                                defaultValue:
                                    '{{count}} alert of {{name}} reported by {{orgUnits}}',
                                defaultValue_plural:
                                    '{{count}} alerts of {{name}} reported by {{orgUnits}}',
                            })
                        )}
                        empty={i18n.t('None reported.')}
                    />
                </>
            )}
        </SectionFrame>
    )
}
