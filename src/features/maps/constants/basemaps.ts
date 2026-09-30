import i18n from '@dhis2/d2-i18n'
import osmDetailed from '@/assets/osm.png'
import light from '@/assets/osmlight.png'
import type { BasemapType } from '../types/map.types'

export interface Basemap {
    name: string
    url: string
    attribution: string
    thumbnail: string
}

/**
 * Tile layers offered under the thematic layer. Both are key-free; "light" was CARTO,
 * which now requires an API key (tiles showed "API KEY REQUIRED").
 * The keys are stored with saved maps, so they never change.
 */
export const basemaps = (): Record<BasemapType, Basemap> => ({
    'osm-light': {
        name: i18n.t('Light'),
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution:
            'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
        thumbnail: light,
    },
    'osm-detailed': {
        name: i18n.t('OpenStreetMap'),
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        thumbnail: osmDetailed,
    },
})

export const DEFAULT_BASEMAP: BasemapType = 'osm-light'
