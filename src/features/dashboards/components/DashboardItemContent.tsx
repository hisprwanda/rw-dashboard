import { SavedMapView } from '@/features/maps'
import type { DashboardMapItem, DashboardVisualItem } from '../types/dashboard.types'
import { DashboardVisual } from './DashboardVisual'

export type DashboardItem = DashboardVisualItem | DashboardMapItem

export const isMapItem = (item: DashboardItem): item is DashboardMapItem => 'isMapItem' in item

export const itemTitle = (item: DashboardItem) => (isMapItem(item) ? item.mapName : item.visualName)

/** The chart or map of one dashboard item. */
export const DashboardItemContent = ({ item }: { item: DashboardItem }) =>
    isMapItem(item) ? (
        <div className="h-full w-full">
            <SavedMapView
                geoFeaturesQuery={item.geoFeaturesQuery}
                analyticsQuery={item.mapAnalyticsQueryOneQuery}
                basemap={item.BasemapType}
                settings={item.mapSettings}
                dataSourceId={item.dataSourceId}
            />
        </div>
    ) : (
        <DashboardVisual item={item} />
    )
