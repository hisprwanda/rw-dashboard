/**
 * Light public entry of the charts feature (no components, no recharts): importable as
 * `@/features/charts/constants` by code that must stay small, like Redux slices.
 */
import type { ChartType, VisualSettings } from '../types/chart.types'
import { DEFAULT_COLOR_PALETTE } from './colorPalettes'

export { DEFAULT_COLOR_PALETTE, systemDefaultColorPalettes } from './colorPalettes'

/** Appearance of a new visualization (and of favorites drawn from another app). */
export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
    backgroundColor: '#ffffff',
    visualColorPalette: DEFAULT_COLOR_PALETTE,
    fillColor: '#000000',
    XAxisSettings: { color: '#000000', fontSize: 12 },
    YAxisSettings: { color: '#000000', fontSize: 12 },
}

/** The chart type of a new visualization. */
export const DEFAULT_CHART_TYPE: ChartType = 'Column'
