import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CircularLoader, NoticeBox } from '@dhis2/ui'; // Use NoticeBox for better error display
import { useFetchSavedGeoFeatureByQuery } from '../../../services/maps';
import MapBody from './MapBody';
import { BasemapType } from '../../../types/maps';
import { mapSettingsTypes } from '@/types/mapFormTypes';

interface SingleMapItemProps {
    geoFeaturesQuery: any;
    mapAnalyticsQueryOneQuery: any;
    mapAnalyticsQueryTwo: any;
    basemapType:BasemapType;
    mapSettings:mapSettingsTypesd}

const SingleMapItem: React.FC<SingleMapItemProps> = ({
    geoFeaturesQuery,
    mapAnalyticsQueryOneQuery,
    mapAnalyticsQueryTwo,
    basemapType,
    mapSettings
}) => {
    // Memoize the queries to ensure they remain static
    const memoizedGeoFeaturesQuery = useMemo(() => geoFeaturesQuery, [geoFeaturesQuery]);
    const memoizedMapAnalyticsQueryOne = useMemo(() => mapAnalyticsQueryOneQuery, [mapAnalyticsQueryOneQuery]);
    const memoizedMapAnalyticsQueryTwo = useMemo(() => mapAnalyticsQueryTwo, [mapAnalyticsQueryTwo]);

    // Use memoized queries in the hook
    const { 
        loading, 
        error, 
        runSavedSingleGeoFeature ,
        geoFeaturesSavedData,
        analyticsMapData,
         metaMapData
    } = useFetchSavedGeoFeatureByQuery({
        geoFeaturesQuery: memoizedGeoFeaturesQuery,
        mapAnalyticsQueryOneQuery: memoizedMapAnalyticsQueryOne,
        mapAnalyticsQueryTwo: memoizedMapAnalyticsQueryTwo
    });

    // Fetch data on mount or when queries change
    useEffect(() => {
        runSavedSingleGeoFeature();
    }, [runSavedSingleGeoFeature]);

    // Handle loading state
    if (loading) return <CircularLoader />;

    // Handle errors
    if (error) {
        return <NoticeBox title="Error" error>{error.message}</NoticeBox>;
    }

    // Render data or placeholder
    return (
        <div className='py-1 h-full w-full overflow-auto' >
           <MapBody  mapSettings={mapSettings} analyticsMapData={analyticsMapData} geoFeaturesData={geoFeaturesSavedData} metaMapData={metaMapData}  isHideSideBar={true} currentBasemap={basemapType}    />
        </div>
    );
};

export default SingleMapItem;
