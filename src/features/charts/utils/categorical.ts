import type { ColorPalette } from '../types/chart.types'

/** The color of the series folded into "Other" when there are more series than hues. */
export const OTHER_COLOR = '#9a9a96'

export interface ColoredValue {
    name: string
    value: number
    color: string
    /** True for the "Other" item that holds the series beyond the palette. */
    isOther?: boolean
}

/**
 * Colors values by their position (the entity keeps its hue whatever its rank). Hues
 * are never cycled: values beyond the palette are summed into one gray "Other".
 */
export const colorByEntity = (
    values: ReadonlyArray<{ name: string; value: number }>,
    palette: ColorPalette | undefined,
    otherLabel: string
): ColoredValue[] => {
    const colors = palette?.itemsBackgroundColors ?? []
    const capacity = Math.max(colors.length, 1)
    // With exactly one value too many, "Other" would only hide that one: show it instead.
    const fold = values.length > capacity + 1
    const shown = fold ? values.slice(0, capacity - 1) : values
    const colored = shown.map((entry, index) => ({
        ...entry,
        color: colors[index] ?? OTHER_COLOR,
    }))
    if (!fold) return colored
    const rest = values.slice(capacity - 1)
    return [
        ...colored,
        {
            name: otherLabel,
            value: rest.reduce((sum, entry) => sum + entry.value, 0),
            color: OTHER_COLOR,
            isOther: true,
        },
    ]
}

/** `rgb(…)` of any CSS color (named, hsl, `var(--x)` inside hsl…), or null outside a browser. */
const resolveRgb = (color: string): [number, number, number] | null => {
    if (typeof document === 'undefined') return null
    const probe = document.createElement('span')
    probe.style.color = color
    document.body.appendChild(probe)
    const resolved = getComputedStyle(probe).color
    probe.remove()
    const match = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(resolved)
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null
}

/** White or ink, whichever reads on a fill (labels set inside colored shapes). */
export const textColorOn = (fill: string): string => {
    const rgb = resolveRgb(fill)
    if (!rgb) return '#ffffff'
    const [r, g, b] = rgb.map((channel) => {
        const c = channel / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }) as [number, number, number]
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    // Contrast with white vs with near-black ink (#1f1f1d, luminance ~0.014).
    return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.064 ? '#ffffff' : '#1f1f1d'
}
