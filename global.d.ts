declare module '*.png' {
    const src: string
    export default src
}

declare module '*.jpg' {
    const src: string
    export default src
}

declare module '*.svg' {
    const src: string
    export default src
}

/** The part of `@dhis2/analytics` (which ships no types) that the app uses. */
declare module '@dhis2/analytics' {
    /** A rendered Highcharts chart. */
    export interface HighchartsChart {
        destroy: () => void
        reflow: () => void
    }

    /** The layout rules of a chart type: a layout in (ids per axis), the layout it allows out. */
    export const getAdaptedUiLayoutByType: (
        layout: { columns: string[]; rows: string[]; filters: string[] },
        visType: string
    ) => { columns: string[]; rows: string[]; filters: string[] }

    /** The DHIS2 color sets by key; `PATTERNS` has patterns instead of colors. */
    export const colorSets: Record<string, { colors?: string[] }>

    export const createVisualization: (
        data: unknown,
        layout: unknown,
        element: HTMLElement,
        extraOptions: Record<string, unknown>,
        onError?: (message: string) => void,
        onWarning?: (message: string) => void
    ) => { visualization: HighchartsChart }

    /** The official pivot table; it sizes itself to its parent element. */
    export const PivotTable: import('react').ComponentType<{
        visualization: unknown
        data: unknown
        legendSets?: unknown[]
        renderCounter?: number
    }>
}

/** The part of `@dhis2/maps-gl` (the DHIS2 Maps engine, which ships no types) that the app uses. */
declare module '@dhis2/maps-gl' {
    export interface MapGLLayer {
        addLayer?: (config: Record<string, unknown>) => void
    }

    export default class MapGL {
        constructor(element: HTMLElement, options?: Record<string, unknown>)
        on(event: 'ready' | string, handler: () => void): void
        createLayer(config: Record<string, unknown>): MapGLLayer
        addLayer(layer: MapGLLayer): Promise<void>
        getLayersBounds(): unknown
        fitBounds(bounds: unknown, options?: Record<string, unknown>): void
        resize(): void
        remove(): void
    }

    /** A point inside a polygon, where its label (or bubble) goes. */
    export const poleOfInaccessibility: (geometry: {
        type: string
        coordinates: unknown
    }) => [number, number]
}
