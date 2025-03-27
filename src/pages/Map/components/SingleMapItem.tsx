import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CircularLoader, NoticeBox } from '@dhis2/ui'; // Use NoticeBox for better error display
import { chartComponents } from '../../../constants/systemCharts';
import { VisualSettingsTypes, VisualTitleAndSubtitleType } from '../../../types/visualSettingsTypes';
import { currentInstanceId } from '../../../constants/currentInstanceInfo';
import { useDataSourceData } from '../../../services/DataSourceHooks';
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart';
import { useExternalAnalyticsData } from '../../../services/useFetchExternalAnalytics';
import { useFetchSavedGeoFeatureByQuery } from '../../../services/maps';
import MapBody from './MapBody';

interface SingleMapItemProps {
    geoFeaturesQuery: any;
    mapAnalyticsQueryOneQuery: any;
    mapAnalyticsQueryTwo: any;
}

const SingleMapItem: React.FC<SingleMapItemProps> = ({
    geoFeaturesQuery,
    mapAnalyticsQueryOneQuery,
    mapAnalyticsQueryTwo,
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


    useEffect(()=>{
        console.log("hello saved metax data",{    geoFeaturesSavedData,
            analyticsMapData,
             metaMapData})
    },[    geoFeaturesSavedData,
        analyticsMapData,
         metaMapData])
    // Handle loading state
    if (loading) return <CircularLoader />;

    // Handle errors
    if (error) {
        return <NoticeBox title="Error" error>{error.message}</NoticeBox>;
    }

    // Render data or placeholder
    return (
        <div>
           hello world
           <MapBody analyticsMapData={analyticsMapData} geoFeaturesData={geoFeaturesSavedData} metaMapData={metaMapData}  isHideSideBar={true} />
        </div>
    );
};

export default SingleMapItem;
