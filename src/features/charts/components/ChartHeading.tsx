import type { AnalyticsLayout, MetadataItem } from '@/features/analytics'
import type { VisualTitles } from '../types/chart.types'

interface ChartHeadingProps {
    titles: VisualTitles
    layout?: AnalyticsLayout
}

const subtitleClass = 'text-center text-md font-medium text-gray-600 mt-1'

const ItemList = ({ items }: { items: MetadataItem[] }) => (
    <p className={subtitleClass}>{items.map((item) => item.name).join(', ')}</p>
)

/**
 * Title once, then either the custom subtitle or the items of every dimension that is
 * on the Filter (e.g. "Kigali" when Organisation unit is a filter).
 */
export const ChartHeading = ({ titles, layout }: ChartHeadingProps) => {
    const filters = layout?.Filter ?? []
    const auto = titles.DefaultSubTitle
    const automatic = [
        filters.includes('Period') ? auto?.periods : undefined,
        filters.includes('Organisation unit') ? auto?.orgUnits : undefined,
        filters.includes('Data') ? auto?.dataElements : undefined,
    ].filter((items): items is MetadataItem[] => !!items?.length)

    return (
        <div className="flex flex-col items-center">
            {titles.visualTitle && (
                <h3 className="text-center text-lg font-bold text-gray-800">
                    {titles.visualTitle}
                </h3>
            )}
            {titles.customSubTitle ? (
                <p className={subtitleClass}>{titles.customSubTitle}</p>
            ) : (
                automatic.map((items, index) => <ItemList key={index} items={items} />)
            )}
        </div>
    )
}
