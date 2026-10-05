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
}
