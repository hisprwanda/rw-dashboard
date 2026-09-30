// Build-time variables the app reads through src/shared/constants/env.ts (see .env.example).
process.env.DHIS2_DATA_SOURCES_STORE = 'DATA_SOURCES_STORE'
process.env.DHIS2_DASHBOARD_STORE = 'DASHBOARD_STORE'
process.env.DHIS2_VISUALS_STORE = 'VISUALS_STORE'
process.env.DHIS2_MAPS_STORE = 'MAPS_STORE'

// jsdom lacks these browser APIs used by charts, maps and the grid layout.
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = global.ResizeObserver || ResizeObserverStub
window.matchMedia =
    window.matchMedia ||
    (() => ({
        matches: false,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
    }))
