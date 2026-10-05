import { DEFAULT_VISUALIZER_OPTIONS, toEngineOptions, withOptions } from './visualizerOptions'

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

describe('withOptions', () => {
    it('adds the options to a visualization without touching its layout', () => {
        const result = withOptions(
            { type: 'LINE', columns: [], rows: [], filters: [] },
            { ...DEFAULT_VISUALIZER_OPTIONS, showData: true }
        )
        expect(result).toMatchObject({ type: 'LINE', columns: [], showData: true })
    })
})
