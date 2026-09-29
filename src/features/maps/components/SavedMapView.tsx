import i18n from '@dhis2/d2-i18n'
import { useAnalytics, type StoredAnalyticsQuery } from '@/features/analytics'
import { useDataSourceInstance } from '@/features/data-sources'
import { ErrorState, LoadingState } from '@/shared/components'
import { initialMapBuilder } from '../store/mapBuilderSlice'
import { useGeoFeatures } from '../hooks/useGeoFeatures'
import type { BasemapType, MapSettings, StoredGeoFeaturesQuery } from '../types/map.types'
import { normalizeMapSettings } from '../utils/mapState'
import { ThematicMap } from './ThematicMap'

interface SavedMapViewProps {
    /** The queries saved with the map (copied into dashboard items). */
    geoFeaturesQuery: StoredGeoFeaturesQuery | undefined
    analyticsQuery: StoredAnalyticsQuery | undefined
    basemap?: BasemapType
    settings?: Partial<MapSettings>
    /** Saved data source of the map (the current instance when omitted). */
    dataSourceId?: string
}

/** Read-only rendering of a saved map (dashboards, presentations). */
export const SavedMapView = ({
    geoFeaturesQuery,
    analyticsQuery,
    basemap,
    settings,
    dataSourceId,
}: SavedMapViewProps) => {
    const source = useDataSourceInstance(dataSourceId)
    const geo = useGeoFeatures(
        source.instance ? geoFeaturesQuery?.result.params : undefined,
        source.instance
    )
    // The saved params return both the rows and the metadata.
    const data = useAnalytics(analyticsQuery?.myData.params, source.instance)

    if (source.notFound) {
        return <ErrorState title={i18n.t('Data source not available')} />
    }
    if (source.isLoading || geo.isLoading || data.isLoading) return <LoadingState />
    if (geo.error || data.error) return <ErrorState error={geo.error ?? data.error} />

    return (
        <ThematicMap
            geoFeatures={geo.data ?? []}
            data={data.data}
            basemap={basemap ?? initialMapBuilder.basemap}
            settings={normalizeMapSettings(settings)}
            compact
        />
    )
}
