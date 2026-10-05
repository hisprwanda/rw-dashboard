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

    export const createVisualization: (
        data: unknown,
        layout: unknown,
        element: HTMLElement,
        extraOptions: Record<string, unknown>,
        onError?: (message: string) => void,
        onWarning?: (message: string) => void
    ) => { visualization: HighchartsChart }
}
