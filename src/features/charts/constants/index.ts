/**
 * Light public entry of the charts feature (no components, no recharts): importable as
 * `@/features/charts/constants` by code that must stay small, like Redux slices.
 */
import type { ChartType } from '../types/chart.types'

export { DEFAULT_COLOR_PALETTE, systemDefaultColorPalettes } from './colorPalettes'

/** The chart type of a new visualization. */
export const DEFAULT_CHART_TYPE: ChartType = 'Column'
