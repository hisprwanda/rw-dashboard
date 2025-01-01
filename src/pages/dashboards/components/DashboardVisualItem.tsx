import React, { useCallback, useEffect, useState } from 'react';
import { CircularLoader, NoticeBox } from '@dhis2/ui'; // Use NoticeBox for better error display
import { chartComponents } from '../../../constants/systemCharts';
import { VisualSettingsTypes, VisualTitleAndSubtitleType } from '../../../types/visualSettingsTypes';
import { currentInstanceId } from '../../../constants/currentInstanceInfo';
import { useDataSourceData } from '../../../services/DataSourceHooks';
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart';
import { useExternalAnalyticsData } from '../../../services/useFetchExternalAnalytics';

interface DashboardVisualItemProps {
    query: any;
    visualType: string;
    visualTitleAndSubTitle: VisualTitleAndSubtitleType;
    visualSettings: VisualSettingsTypes;
    dataSourceId: string;
}

const DashboardVisualItem: React.FC<DashboardVisualItemProps> = ({
    query,
    visualType,
    visualSettings,
    visualTitleAndSubTitle,
    dataSourceId,
}) => {
    const { data: savedDataSource, loading, error, isError } = useDataSourceData();
    const { runSavedSingleVisualAnalytics, data: internalData, loading: internalLoading, error: internalError } = useFetchSingleChartApi(query);
    const { fetchExternalAnalyticsData, response: externalData, loading: externalLoading, error: externalError } = useExternalAnalyticsData();

    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        console.log('externalData', externalData);
        console.log('internalData', internalData);
    }, [externalData, internalData]);

    // Determine data source and fetch data
    const fetchData = useCallback(async () => {
        const isCurrentInstance = dataSourceId === currentInstanceId;

        if (isCurrentInstance) {
            // Fetch data from the current instance
            await runSavedSingleVisualAnalytics();
        } else {
            // Fetch data from an external instance
            const externalSource = savedDataSource?.dataStore?.entries?.find((item: any) => item.key === dataSourceId)?.value;
            if (externalSource) {
                await fetchExternalAnalyticsData(query, externalSource.token, externalSource.url);
            }
        }
    }, [dataSourceId, savedDataSource, query, runSavedSingleVisualAnalytics, fetchExternalAnalyticsData]);

    // Fetch data on mount or when dependencies change
    useEffect(() => {
        if (!loading && !error) {
            fetchData();
        }
    }, [loading, error]);

    // Update chart data based on fetch results
    useEffect(() => {
        const isCurrentInstance = dataSourceId === currentInstanceId;
        setChartData(isCurrentInstance ? internalData : externalData);
    }, [internalData, externalData, dataSourceId]);

    // Handle loading state
    if (loading || internalLoading || externalLoading) return <CircularLoader />;

    // Handle errors
    if (isError || internalError || externalError) {
        const errorMessage = error?.message || internalError?.message || externalError?.message;
        return <NoticeBox title="Error" error>{errorMessage}</NoticeBox>;
    }

    // Render the selected chart
    const renderChart = () => {
        const SelectedChart = chartComponents.find((chart) => chart.type === visualType)?.component;
        return SelectedChart ? (
            <SelectedChart
                data={chartData}
                visualSettings={visualSettings}
                visualTitleAndSubTitle={visualTitleAndSubTitle}
            />
        ) : null;
    };

    return <div>{renderChart()}</div>;
};

export default DashboardVisualItem;
