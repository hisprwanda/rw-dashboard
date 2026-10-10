/**
 * Classification of thematic map values into legend classes, ported from the DHIS2 Maps
 * app (`src/util/classify.js`, `src/util/legend.js`, BSD-2-Clause) so that maps drawn here
 * get the same classes, boundaries and colors as in DHIS2.
 */

/** Classification methods, as saved in a map view's `method`. */
export const CLASSIFICATION_PREDEFINED = 1
export const CLASSIFICATION_EQUAL_INTERVALS = 2
export const CLASSIFICATION_EQUAL_COUNTS = 3
export const CLASSIFICATION_NATURAL_BREAKS_RANGES = 4
export const CLASSIFICATION_NATURAL_BREAKS_CLUSTERS = 5
export const CLASSIFICATION_PRETTY_BREAKS = 6
export const CLASSIFICATION_LOGARITHMIC = 7
export const CLASSIFICATION_STANDARD_DEVIATION = 8
export const CLASSIFICATION_SINGLE_COLOR = 10

export const DEFAULT_CLASSES = 5

/** ColorBrewer `YlOrBr`, the Maps app's default color scale, by number of classes. */
const YL_OR_BR: Record<number, string[]> = {
    3: ['#fff7bc', '#fec44f', '#d95f0e'],
    4: ['#ffffd4', '#fed98e', '#fe9929', '#cc4c02'],
    5: ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'],
    6: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#d95f0e', '#993404'],
    7: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
    8: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
    9: [
        '#ffffe5',
        '#fff7bc',
        '#fee391',
        '#fec44f',
        '#fe9929',
        '#ec7014',
        '#cc4c02',
        '#993404',
        '#662506',
    ],
}

/** The default color scale for a number of classes. */
export const defaultColorScale = (classes: number = DEFAULT_CLASSES): string[] =>
    YL_OR_BR[Math.min(9, Math.max(3, classes))] ?? YL_OR_BR[DEFAULT_CLASSES] ?? []

export interface LegendItem {
    startValue?: number
    endValue?: number
    color?: string
    name?: string
    isIsolated?: boolean
    isNoData?: boolean
    isUnclassified?: boolean
    count?: number
}

export const isRegularLegendItem = (item: LegendItem) =>
    !item.isNoData && !item.isUnclassified && !item.isIsolated

type ValueFormat = (value: number) => number

/** Rounds to `decimals` places, or keeps the value when no precision is set. */
export const roundToPrecision =
    (decimals: number | undefined): ValueFormat =>
    (value) =>
        decimals === undefined ? value : Math.round(value * 10 ** decimals) / 10 ** decimals

const exponent = (value: number) => Number(Math.abs(value).toExponential().split('e')[1])

/** d3-format's `precisionRound`: the decimals that tell `max` apart in steps of `step`. */
export const precisionRound = (step: number, max: number) => {
    const size = Math.abs(step)
    const top = Math.abs(max) - size
    return Math.max(0, exponent(top) - exponent(size)) + 1
}

const hasNumber = (value: unknown): value is number =>
    typeof value === 'number' && !Number.isNaN(value)

/** The legend item a value belongs to; `undefined` for no data or values outside every class. */
export const getLegendItemForValue = ({
    value,
    valueFormat,
    method,
    legendItems,
    clamp = false,
}: {
    value: number | undefined
    valueFormat?: ValueFormat
    method?: number
    legendItems: readonly LegendItem[]
    clamp?: boolean
}): LegendItem | undefined => {
    if (!hasNumber(value) || legendItems.length === 0) return undefined
    const formatted = valueFormat ? valueFormat(value) : value
    const within = (item: LegendItem) =>
        formatted >= (item.startValue ?? -Infinity) && formatted <= (item.endValue ?? Infinity)

    const isolated = legendItems.find((item) => item.isIsolated && within(item))
    if (isolated) return isolated

    const ranges = legendItems.filter(isRegularLegendItem)
    const first = ranges[0]
    const last = ranges.at(-1)
    if (clamp && first && last) {
        if (formatted < (first.startValue ?? -Infinity)) return first
        if (formatted > (last.endValue ?? Infinity)) return last
    }

    const isClusters = method === CLASSIFICATION_NATURAL_BREAKS_CLUSTERS
    return ranges.find((item, index) => {
        const start = item.startValue ?? -Infinity
        const end = item.endValue ?? Infinity
        if (start === end) return formatted === start
        return (
            formatted >= start &&
            (formatted < end || (formatted === end && (isClusters || index === ranges.length - 1)))
        )
    })
}

interface Classification {
    items: LegendItem[]
    valueFormat?: ValueFormat
}

const precisionFor = (
    precision: number | undefined,
    min: number,
    max: number,
    numClasses: number
) => precision ?? precisionRound((max - min) / numClasses, max)

const equalIntervals = (
    min: number,
    max: number,
    numClasses: number,
    precision?: number
): Classification => {
    const size = (max - min) / numClasses
    const valueFormat = roundToPrecision(precision ?? precisionRound(size, max))
    const items = Array.from({ length: numClasses }, (_, i) => {
        const start = min + i * size
        const end = i < numClasses - 1 ? start + size : max
        return { startValue: valueFormat(start), endValue: valueFormat(end) }
    })
    return { items, valueFormat }
}

const quantiles = (values: readonly number[], numClasses: number, precision?: number) => {
    const min = values[0] ?? 0
    const max = values.at(-1) ?? 0
    const valueFormat = roundToPrecision(precisionFor(precision, min, max, numClasses))
    const perClass = values.length / numClasses
    const breaks: Array<number | undefined> = [min]
    let position = perClass
    for (let i = 1; i < numClasses; i++) {
        breaks.push(values[Math.round(position)])
        position += perClass
    }
    const defined = breaks.filter((value): value is number => value !== undefined)
    return {
        items: defined.map((value, index) => ({
            startValue: valueFormat(value),
            endValue: valueFormat(defined[index + 1] ?? max),
        })),
        valueFormat,
    }
}

/** Breaks at whole multiples of 1, 2 or 5 × a power of ten. */
const prettyBreaks = (min: number, max: number, numClasses: number, precision?: number) => {
    const rough = (max - min) / numClasses
    const magnitude = 10 ** Math.floor(Math.log10(rough))
    const steps = [1, 2, 5].map((n) => n * magnitude)
    const step = [...steps].reverse().find((s) => s <= rough) ?? steps[0] ?? rough
    const valueFormat = roundToPrecision(precisionFor(precision, min, max, numClasses))
    const internal: number[] = []
    let next = Math.ceil(min / step) * step
    if (next === min) next += step
    while (next < max && internal.length < numClasses - 1) {
        internal.push(next)
        next += step
    }
    const all = [min, ...internal, max]
    return {
        items: all.slice(0, -1).map((start, i) => ({
            startValue: valueFormat(start),
            endValue: valueFormat(all[i + 1] ?? max),
        })),
        valueFormat,
    }
}

const logarithmic = (min: number, max: number, numClasses: number, precision?: number) => {
    const logMin = Math.log(min)
    const step = (Math.log(max) - logMin) / numClasses
    const valueFormat = roundToPrecision(precisionFor(precision, min, max, numClasses))
    return {
        items: Array.from({ length: numClasses }, (_, i) => ({
            startValue: valueFormat(Math.exp(logMin + i * step)),
            endValue: valueFormat(i < numClasses - 1 ? Math.exp(logMin + (i + 1) * step) : max),
        })),
        valueFormat,
    }
}

const standardDeviation = (values: readonly number[], numClasses: number, precision?: number) => {
    const min = values[0] ?? 0
    const max = values.at(-1) ?? 0
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const sigma = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length)
    const valueFormat = roundToPrecision(precisionFor(precision, min, max, numClasses))
    const isEven = numClasses % 2 === 0
    const maxOffset = Math.floor((numClasses - 1) / 2)
    const internal = Array.from({ length: numClasses - 1 }, (_, i) => {
        let offset = i - maxOffset
        if (!isEven && offset >= 0) offset += 1
        return mean + offset * sigma
    })
    const all = [mean - (maxOffset + 1) * sigma, ...internal, mean + (maxOffset + 1) * sigma]
    return {
        items: all.slice(0, -1).map((start, i) => ({
            startValue: valueFormat(start),
            endValue: valueFormat(all[i + 1] ?? start),
        })),
        valueFormat,
    }
}

/**
 * Automatic classes of sorted values. Natural breaks (Jenks/ckmeans) are approximated by
 * equal counts, the closest method this app implements.
 */
export const getLegendItems = (
    values: readonly number[],
    method: number,
    { numClasses, precision }: { numClasses: number; precision?: number }
): Classification => {
    const min = values[0]
    const max = values.at(-1)
    if (min === undefined || max === undefined) return { items: [] }
    if (min === max) return { items: [{ startValue: min, endValue: max }] }
    const k = Math.min(numClasses, new Set(values).size)

    let result: Classification
    switch (method) {
        case CLASSIFICATION_EQUAL_COUNTS:
        case CLASSIFICATION_NATURAL_BREAKS_RANGES:
        case CLASSIFICATION_NATURAL_BREAKS_CLUSTERS:
            result = quantiles(values, k, precision)
            break
        case CLASSIFICATION_STANDARD_DEVIATION:
            result = standardDeviation(values, numClasses, precision)
            break
        case CLASSIFICATION_LOGARITHMIC: {
            const positive = values.filter((v) => v > 0)
            const low = positive[0]
            const high = positive.at(-1)
            if (low === undefined || high === undefined) return { items: [] }
            result = logarithmic(low, high, numClasses, precision)
            break
        }
        case CLASSIFICATION_PRETTY_BREAKS:
            result = prettyBreaks(min, max, numClasses, precision)
            break
        default:
            result = equalIntervals(min, max, k, precision)
    }
    return {
        items: result.items.filter(
            (bin, index, all) =>
                index === 0 ||
                bin.startValue !== all[index - 1]?.startValue ||
                bin.endValue !== all[index - 1]?.endValue
        ),
        valueFormat: result.valueFormat,
    }
}

/** The legend items of a predefined DHIS2 legend set, sorted by start value. */
export const getPredefinedLegendItems = (
    legends: ReadonlyArray<{
        name?: string
        startValue: number
        endValue: number
        color: string
    }>
): LegendItem[] =>
    [...legends]
        .sort((a, b) => a.startValue - b.startValue)
        .map(({ name, startValue, endValue, color }) => ({ name, startValue, endValue, color }))

export interface IsolatedClass {
    min: number
    max: number
    color: string
    name?: string
}

export const buildIsolatedLegendItem = ({ min, max, color, name }: IsolatedClass): LegendItem => ({
    startValue: min,
    endValue: max,
    color,
    isIsolated: true,
    ...(name ? { name } : {}),
})

/** Automatic legend items of sorted values, colored with the color scale. */
export const getAutomaticLegendItems = ({
    data,
    method = CLASSIFICATION_EQUAL_INTERVALS,
    classes = DEFAULT_CLASSES,
    colorScale,
    legendDecimalPlaces,
    legendIsolated,
}: {
    data: readonly number[]
    method?: number
    classes?: number
    colorScale?: readonly string[]
    legendDecimalPlaces?: number
    legendIsolated?: IsolatedClass
}): Classification => {
    if (data.length === 0 && !legendIsolated) return { items: [] }
    const colors = colorScale?.length ? colorScale : defaultColorScale(classes)
    let toClassify = data
    let isolated: LegendItem | null = null
    if (legendIsolated) {
        toClassify = data.filter((v) => v < legendIsolated.min || v > legendIsolated.max)
        isolated = buildIsolatedLegendItem(legendIsolated)
        if (toClassify.length === 0) return { items: [isolated] }
    }
    const classification = getLegendItems(toClassify, method, {
        numClasses: classes,
        precision: legendDecimalPlaces,
    })
    const items = classification.items.map((item, i) => ({ ...item, color: colors[i] }))
    return {
        items: isolated ? [isolated, ...items] : items,
        valueFormat: classification.valueFormat,
    }
}
