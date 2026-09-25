/**
 * Typed access to build-time environment variables.
 *
 * The App Platform statically replaces `process.env.DHIS2_*` at build time, so each
 * variable must be referenced by its full literal name below (no dynamic lookups).
 * Define them in `.env` (see `.env.example`).
 */
const required = (name: string, value: string | undefined): string => {
    if (!value) {
        throw new Error(
            `Missing environment variable ${name}. Add it to your .env file (see .env.example).`
        )
    }
    return value
}

export const env = {
    dataSourcesStore: required('DHIS2_DATA_SOURCES_STORE', process.env.DHIS2_DATA_SOURCES_STORE),
    dashboardStore: required('DHIS2_DASHBOARD_STORE', process.env.DHIS2_DASHBOARD_STORE),
    visualsStore: required('DHIS2_VISUALS_STORE', process.env.DHIS2_VISUALS_STORE),
    mapsStore: required('DHIS2_MAPS_STORE', process.env.DHIS2_MAPS_STORE),
} as const
