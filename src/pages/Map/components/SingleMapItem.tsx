import React, { useCallback, useEffect, useState } from 'react';
import { CircularLoader, NoticeBox } from '@dhis2/ui'; // Use NoticeBox for better error display
import { chartComponents } from '../../../constants/systemCharts';
import { VisualSettingsTypes, VisualTitleAndSubtitleType } from '../../../types/visualSettingsTypes';
import { currentInstanceId } from '../../../constants/currentInstanceInfo';
import { useDataSourceData } from '../../../services/DataSourceHooks';
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart';
import { useExternalAnalyticsData } from '../../../services/useFetchExternalAnalytics';

interface SingleMapItemProps {
    geoFeaturesQuery: any;
    mapAnalyticsQueryOneQuery:any;
    mapAnalyticsQueryTwo:any
    visualType: string;
    dataSourceId: string;
}

const SingleMapItem: React.FC<SingleMapItemProps> = ({
    geoFeaturesQuery,
    mapAnalyticsQueryOneQuery,
    mapAnalyticsQueryTwo,
    visualType,
    dataSourceId,
}) => {
    const { data: savedDataSource, loading, error, isError } = useDataSourceData();
    const { runSavedSingleVisualAnalytics, data: internalData, loading: internalLoading, error: internalError } = useFetchSingleChartApi(geoFeaturesQuery);

    const [chartData, setChartData] = useState<any>(null);


    // Determine data source and fetch data
    const fetchData = useCallback(async () => {
        const isCurrentInstance = dataSourceId === currentInstanceId;

        if (isCurrentInstance) {
            // Fetch data from the current instance
            await runSavedSingleVisualAnalytics();
        } 
    }, [dataSourceId, savedDataSource, geoFeaturesQuery, runSavedSingleVisualAnalytics]);

    // Fetch data on mount or when dependencies change
    useEffect(() => {
        if (!loading && !error) {
            fetchData();
        }
    }, [loading, error]);

    // Update chart data based on fetch results
    useEffect(() => {
        const isCurrentInstance = dataSourceId === currentInstanceId;
        setChartData(isCurrentInstance && internalData );
    }, [internalData, dataSourceId]);

    // Handle loading state
    if (loading || internalLoading ) return <CircularLoader />;

    // Handle errors
    if (isError || internalError || ) {
        const errorMessage = error?.message || internalError?.message ;
        return <NoticeBox title="Error" error>{errorMessage}</NoticeBox>;
    }

    // Render the selected chart
    const renderChart = () => {
        const SelectedChart = chartComponents.find((chart) => chart.type === visualType)?.component;
        return SelectedChart ? (
            <SelectedChart
                data={chartData}
          
            />
        ) : null;
    };

    return <div>{renderChart()}</div>;
};

export default SingleMapItem;
