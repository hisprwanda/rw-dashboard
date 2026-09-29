import { DATA_SET_METRICS } from '../constants/dataItemTypes'
import type { DataItem, DataItemsFilters, PickerOption } from '../types/dataItem.types'

/**
 * Transfer options for a list of items. Data sets expand into one option per metric
 * (`<id>.<METRIC>`), optionally narrowed to the chosen metric.
 */
export const toPickerOptions = (
    items: readonly DataItem[],
    filters: DataItemsFilters
): PickerOption[] => {
    if (filters.type !== 'dataSets')
        return items.map((item) => ({ label: item.name, value: item.id }))
    const metrics = filters.metric
        ? DATA_SET_METRICS.filter((metric) => metric.value === filters.metric)
        : DATA_SET_METRICS
    return items.flatMap((item) =>
        metrics.map((metric) => ({
            label: `${item.name} - ${metric.label}`,
            value: `${item.id}.${metric.value}`,
        }))
    )
}

/** Remove duplicates (same value), keeping the first occurrence. */
export const uniqueOptions = (options: readonly PickerOption[]): PickerOption[] => {
    const seen = new Set<string>()
    return options.filter((option) => !seen.has(option.value) && !!seen.add(option.value))
}
