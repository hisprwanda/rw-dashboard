/**
 * Replaces the Earth Engine worker of `@dhis2/maps-gl` (see `viteConfigExtensions.mts`):
 * the app draws no Earth Engine layers, and the worker would add 1.4 MB to the map chunk.
 */
const getEarthEngineWorker = (): Promise<never> =>
    Promise.reject(new Error('Earth Engine layers are not supported in this app.'))

export default getEarthEngineWorker
