import { PivotTable } from '@dhis2/analytics'
import { useMemo } from 'react'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { withHeaderIndexes } from '../utils/analyticsData'
import type { Visualization } from '../types/visualization.types'

interface DhisPivotTableProps {
    /** The analytics response, with its metadata. */
    data: AnalyticsResponse
    visualization: Visualization
    /** Legend sets the table colors values with (the one the visualization names). */
    legendSets?: unknown[]
}

/** The official DHIS2 pivot table (totals, subtotals, legend colors, sortable columns). */
export const DhisPivotTable = ({ data, visualization, legendSets }: DhisPivotTableProps) => {
    const indexed = useMemo(() => withHeaderIndexes(data), [data])
    return (
        // The table sizes itself to its parent.
        <div className="relative h-[480px] w-full overflow-hidden">
            <PivotTable visualization={visualization} data={indexed} legendSets={legendSets} />
        </div>
    )
}
