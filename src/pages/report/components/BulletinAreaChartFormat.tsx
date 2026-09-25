import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { ChartConfig } from '../../../components/ui/chart'
import { visualColorPaletteTypes } from '../../../types/visualSettingsTypes'

export function generateBulletinChartConfig(
    inputData: AnalyticsResponse,
    selectedColorPalette?: visualColorPaletteTypes
): ChartConfig {
    const config: ChartConfig = {}
    const inputDataArray = Object.values(inputData)
    inputDataArray.forEach((item: string, index: number) => {
        const name = item.name

        // Determine color based on the format of selectedColorPalette
        const color = selectedColorPalette.itemsBackgroundColors.every((color) =>
            color.startsWith('hsl')
        ) // Check if all are HSL
            ? selectedColorPalette.itemsBackgroundColors[index] || `hsl(var(--chart-${index + 1}))`
            : selectedColorPalette.itemsBackgroundColors[index] ||
              selectedColorPalette.itemsBackgroundColors[0] // Use first color as fallback for HEX or RGB

        config[name] = {
            label: name,
            color,
        }
    })

    return config
}
