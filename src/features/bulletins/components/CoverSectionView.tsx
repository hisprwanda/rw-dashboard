import type { BulletinContext, CoverSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'

export const CoverSectionView = ({
    section,
    context,
}: {
    section: CoverSection
    context: BulletinContext
}) => {
    const text = (value: CoverSection['title']) =>
        pickText(value, context.language, context.languages)
    return (
        <div className="bulletin-section mb-8 text-center">
            {section.logos.length > 0 && (
                <div className="mb-6 flex items-center justify-between gap-4">
                    {section.logos.map((logo, index) => (
                        <img key={index} src={logo} alt="" className="max-h-24 max-w-[45%]" />
                    ))}
                </div>
            )}
            <h1 className="m-0 text-4xl font-bold uppercase tracking-wide">
                {text(section.title)}
            </h1>
            {text(section.subtitle) && <p className="mt-2 text-xl">{text(section.subtitle)}</p>}
            <p className="mt-2 text-lg font-semibold">{context.periodName}</p>
            <p className="m-0 text-gray-700">
                {context.range.startDate} – {context.range.endDate}
            </p>
            {section.description && (
                <p className="mt-6 whitespace-pre-line text-left">{text(section.description)}</p>
            )}
        </div>
    )
}
