/**
 * Raster basemaps for the DHIS2 Maps basemaps that need no API key.
 *
 * DHIS2's OSM Light / Dark / Fiord are vector styles. The map engine hides the data layers
 * while a vector style loads and shows them again only once every vector tile is drawn,
 * so a slow tile server leaves the map empty. Their raster counterparts below draw the data
 * at once. Keyed basemaps (Bing, Azure, Google) get the light basemap.
 */

const ESRI_ATTRIBUTION =
    'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
const OSM_ATTRIBUTION =
    '&copy; <a target="_blank" rel="noreferrer" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const esri = (service: string) => ({
    type: 'tileLayer',
    url: `https://server.arcgisonline.com/ArcGIS/rest/services/${service}/MapServer/tile/{z}/{y}/{x}`,
    attribution: ESRI_ATTRIBUTION,
})

const LIGHT = esri('Canvas/World_Light_Gray_Base')
const DARK = esri('Canvas/World_Dark_Gray_Base')

const BASEMAPS: Record<string, Record<string, unknown>> = {
    osmLight: LIGHT,
    osmDark: DARK,
    osmFiord: DARK,
    openStreetMap: {
        type: 'tileLayer',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: OSM_ATTRIBUTION,
    },
}

/** The engine config of a map's saved basemap, or `null` for "no basemap". */
export const basemapConfig = (
    basemap: string | { id?: string } | undefined
): Record<string, unknown> | null => {
    const id = typeof basemap === 'string' ? basemap : basemap?.id
    if (id === 'none') return null
    return BASEMAPS[id ?? 'osmLight'] ?? LIGHT
}
