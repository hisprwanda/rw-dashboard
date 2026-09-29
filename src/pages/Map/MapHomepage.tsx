import React, { useEffect } from 'react'
import MapBody from './components/MapBody'
import { useAuthorities } from '../../context/AuthContext'
import { useParams } from 'react-router-dom'
import { useFetchSingleMapData } from '../../services/fetchSingleStoredMap'
import { Loader } from '@mantine/core'
import { useRunGeoFeatures } from '../../services/maps'
import { formatAnalyticsDimensions } from '@/features/analytics'
import { CircularLoader } from '@dhis2/ui'
import { useResetAnalyticsStatesToDefault } from '../../hooks/useResetAnalyticsStatesTDefault'

const MapHomepage: React.FC = () => {
    const { id: mapId, mapName } = useParams()
    const {
        geoFeaturesData,
        analyticsMapData,
        metaMapData,
        setIsUseCurrentUserOrgUnits,
        isSetPredifinedUserOrgUnits,
        isFetchAnalyticsDataLoading,
        currentBasemap,
        legendType,
        mapSettings,
    } = useAuthorities()
    const {
        data: singleSavedMapData,
        error,
        isError,
        loading,
        isHandleDataSourceChangeLoading,
    } = useFetchSingleMapData(mapId)
    const { loading: isFetchingGeoFeaturesLoading } = useRunGeoFeatures()
    const { resetAnalyticsStatesToDefaultValues } = useResetAnalyticsStatesToDefault()
    // A new map starts from a clean state (the maps list no longer resets it).
    useEffect(() => {
        if (!mapId) resetAnalyticsStatesToDefaultValues({ isBeingUsedInMap: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapId])
    // update if current user organization is selected
    //   useEffect(() => {
    //     console.log("isSetPredifinedUserOrgUnits in map ",isSetPredifinedUserOrgUnits )
    //     if (singleSavedMapData) {
    //         const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(value => value === true);
    //         setIsUseCurrentUserOrgUnits(isAnyTrue);
    //     }
    // }, [isSetPredifinedUserOrgUnits]);

    if (loading || isFetchAnalyticsDataLoading || isFetchingGeoFeaturesLoading) {
        return (
            <div className="flex justify-center align-middle">
                <CircularLoader />
            </div>
        )
    }

    /// main return
    return (
        <div className=" py-1 h-[calc(100vh-50px)] w-screen overflow-auto">
            <MapBody
                analyticsMapData={analyticsMapData}
                geoFeaturesData={geoFeaturesData}
                metaMapData={metaMapData}
                singleSavedMapData={singleSavedMapData}
                mapId={mapId}
                mapName={mapName}
                currentBasemap={currentBasemap}
                mapSettings={mapSettings}
            />
        </div>
    )
}

export default MapHomepage
