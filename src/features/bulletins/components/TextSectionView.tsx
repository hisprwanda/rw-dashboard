import type { BulletinContext, TextSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { SectionFrame } from './SectionFrame'

export const TextSectionView = ({
    section,
    context,
}: {
    section: TextSection
    context: BulletinContext
}) => (
    <SectionFrame title={pickText(section.title, context.language, context.languages)}>
        <p className="whitespace-pre-line leading-relaxed">
            {pickText(section.body, context.language, context.languages)}
        </p>
    </SectionFrame>
)
