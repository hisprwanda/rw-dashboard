import type { Dhis2ObjectType, InstalledApp } from '../types/dhis2Object.types'

/** The app whose plugin draws each kind of favorite (as the official Dashboard app does). */
export const PLUGIN_APP: Record<Dhis2ObjectType, string> = {
    visualization: 'data-visualizer',
    map: 'maps',
}

/**
 * The URL of the official plugin (`…/dhis-web-data-visualizer/plugin.html`) for a kind of
 * favorite, or `null` when the app is missing or too old to have one (DHIS2 < 2.40).
 *
 * The server builds `pluginLaunchUrl` from its own address (`contextPath`); it is rebased
 * on the app's `baseUrl` so the plugin loads from the same place as the app's API calls
 * (and shares its session), also behind the development proxy.
 */
export const pluginUrl = ({
    apps,
    objectType,
    baseUrl,
    contextPath,
    pageUrl,
}: {
    apps: readonly InstalledApp[] | undefined
    objectType: Dhis2ObjectType
    baseUrl: string
    contextPath: string | undefined
    pageUrl: string
}): string | null => {
    const launchUrl = apps?.find((app) => app.key === PLUGIN_APP[objectType])?.pluginLaunchUrl
    if (!launchUrl) return null
    const prefix = (contextPath ?? '').replace(/\/+$/, '')
    if (!prefix || !launchUrl.startsWith(prefix)) return launchUrl
    const path = launchUrl.slice(prefix.length)
    return new URL(`${baseUrl.replace(/\/+$/, '')}${path}`, pageUrl).href
}

/** Where a favorite opens in its own DHIS2 app (`baseUrl` of that instance). */
export const openInDhis2Url = (baseUrl: string, objectType: Dhis2ObjectType, id: string) => {
    const base = baseUrl.replace(/\/+$/, '')
    return objectType === 'map'
        ? `${base}/dhis-web-maps/index.html?id=${encodeURIComponent(id)}`
        : `${base}/dhis-web-data-visualizer/index.html#/${encodeURIComponent(id)}`
}
