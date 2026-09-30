import { Dhis2ObjectView } from '@/features/dhis2-objects'
import { SavedMapView } from '@/features/maps'
import type {
    DashboardDhis2Item,
    DashboardMapItem,
    DashboardVisualItem,
} from '../types/dashboard.types'
import { DashboardVisual } from './DashboardVisual'

export type DashboardItem = DashboardVisualItem | DashboardMapItem | DashboardDhis2Item

export const isDhis2Item = (item: DashboardItem): item is DashboardDhis2Item =>
    'kind' in item && item.kind === 'dhis2'

export const isMapItem = (item: DashboardItem): item is DashboardMapItem => 'isMapItem' in item

export const itemTitle = (item: DashboardItem) =>
    isDhis2Item(item) ? item.name : isMapItem(item) ? item.mapName : item.visualName

/** The chart or map of one dashboard item. */
export const DashboardItemContent = ({ item }: { item: DashboardItem }) => {
    if (isDhis2Item(item)) {
        return (
            <div className="h-full w-full">
                <Dhis2ObjectView
                    objectType={item.objectType}
                    objectId={item.objectId}
                    name={item.name}
                    dataSourceId={item.dataSourceId}
                />
            </div>
        )
    }
    return isMapItem(item) ? (
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
}
