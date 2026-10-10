import {
    DEFAULT_PIVOT_TABLE_OPTIONS,
    DEFAULT_VISUALIZER_OPTIONS,
    toEngineOptions,
    withOptions,
} from './visualizerOptions'

describe('toEngineOptions', () => {
    it('maps the legend toggle and leaves the range axis open by default', () => {
        const engine = toEngineOptions({ ...DEFAULT_VISUALIZER_OPTIONS, hideLegend: true })
        expect(engine.seriesKey).toEqual({ hidden: true })
        expect(engine.axes).toEqual([
            expect.objectContaining({
                type: 'RANGE',
                index: 0,
                minValue: undefined,
                title: undefined,
                baseLine: { enabled: false, value: undefined, title: undefined },
            }),
        ])
    })

    it('uses the range axis limits, title and reference lines', () => {
        const [axis] = toEngineOptions({
            ...DEFAULT_VISUALIZER_OPTIONS,
            rangeAxisMin: 0,
            rangeAxisMax: 100,
            rangeAxisSteps: 5,
            rangeAxisTitle: 'Coverage %',
            targetLine: { enabled: true, value: 90, title: 'Target' },
        }).axes
        expect(axis).toMatchObject({
            minValue: 0,
            maxValue: 100,
            steps: 5,
            title: { text: 'Coverage %', textMode: 'CUSTOM' },
            targetLine: { enabled: true, value: 90, title: { text: 'Target' } },
        })
    })

    it('does not enable a reference line without a value', () => {
        const [axis] = toEngineOptions({
            ...DEFAULT_VISUALIZER_OPTIONS,
            baseLine: { enabled: true },
        }).axes
        expect(axis?.baseLine.enabled).toBe(false)
    })
})

describe('legend', () => {
    it('uses a fixed legend set only when one is chosen', () => {
        expect(toEngineOptions(DEFAULT_VISUALIZER_OPTIONS).legend).toBeUndefined()
        expect(
            toEngineOptions({
                ...DEFAULT_VISUALIZER_OPTIONS,
                legendSetId: 'ls1',
                legendStyle: 'TEXT',
            }).legend
        ).toEqual({ strategy: 'FIXED', style: 'TEXT', set: { id: 'ls1' } })
    })
})

describe('withOptions legend sets', () => {
    const options = { ...DEFAULT_VISUALIZER_OPTIONS, legendSetId: 'ls1' }

    it('keeps the legend set for chart types that support it', () => {
        const column = withOptions({ type: 'COLUMN', columns: [], rows: [], filters: [] }, options)
        expect(column.legend?.set.id).toBe('ls1')
    })

    it('drops it for the others', () => {
        const line = withOptions({ type: 'LINE', columns: [], rows: [], filters: [] }, options)
        expect(line.legend).toBeUndefined()
    })
})

describe('withOptions', () => {
    it('adds the options to a visualization without touching its layout', () => {
        const result = withOptions(
            { type: 'LINE', columns: [], rows: [], filters: [] },
            { ...DEFAULT_VISUALIZER_OPTIONS, showData: true }
        )
        expect(result).toMatchObject({ type: 'LINE', columns: [], showData: true })
    })
})

describe('withOptions pivot table', () => {
    const base = { columns: [], rows: [], filters: [] }

    it('applies the pivot table options to pivot tables only', () => {
        const options = {
            ...DEFAULT_VISUALIZER_OPTIONS,
            pivot: { ...DEFAULT_PIVOT_TABLE_OPTIONS, colTotals: true, fontSize: 'LARGE' as const },
        }
        expect(withOptions({ ...base, type: 'PIVOT_TABLE' }, options)).toMatchObject({
            colTotals: true,
            fontSize: 'LARGE',
            showDimensionLabels: true,
        })
        expect(withOptions({ ...base, type: 'COLUMN' }, options)).not.toHaveProperty('colTotals')
    })

    it('uses the defaults for visuals saved without pivot options', () => {
        const { pivot: _pivot, ...older } = DEFAULT_VISUALIZER_OPTIONS
        expect(withOptions({ ...base, type: 'PIVOT_TABLE' }, older)).toMatchObject(
            DEFAULT_PIVOT_TABLE_OPTIONS
        )
    })
})
