import React, { useCallback, useEffect, useState, useRef } from 'react';
import { CircularLoader, NoticeBox } from '@dhis2/ui';
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
    const [renderKey, setRenderKey] = useState(0);

    // Fetch data based on source
    const fetchData = useCallback(async () => {
        try {
            const isCurrentInstance = dataSourceId === currentInstanceId;
            if (isCurrentInstance) {
                await runSavedSingleVisualAnalytics();
            } else {
                const externalSource = savedDataSource?.dataStore?.entries?.find(
                    (item: any) => item.key === dataSourceId
                )?.value;
                if (externalSource) {
                    await fetchExternalAnalyticsData(query, externalSource.token, externalSource.url);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }, [dataSourceId, savedDataSource, query, runSavedSingleVisualAnalytics, fetchExternalAnalyticsData]);

    // Initial data fetch
    useEffect(() => {
        if (!loading && !error) {
            fetchData();
        }
    }, [loading, error, fetchData]);

    // Update chart data when source changes
    useEffect(() => {
        const isCurrentInstance = dataSourceId === currentInstanceId;
        const newData = isCurrentInstance ? internalData : externalData;
        if (newData !== chartData) {
            setChartData(newData);
        }
    }, [internalData, externalData, dataSourceId, chartData]);

    // Handle resize events from the grid layout
    useEffect(() => {
        const handleResize = () => {
            setRenderKey(prev => prev + 1);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loading || internalLoading || externalLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[100px]">
                <CircularLoader small />
            </div>
        );
    }

    if (isError || internalError || externalError) {
        const errorMessage = error?.message || internalError?.message || externalError?.message;
        return <NoticeBox title="Error" error>{errorMessage}</NoticeBox>;
    }

    const renderChart = () => {
        const SelectedChart = chartComponents.find((chart) => chart.type === visualType)?.component;
        if (!SelectedChart || !chartData) return null;

        return (
            <div key={renderKey} className="h-full w-full">
                <SelectedChart
                    data={chartData}
                    visualSettings={visualSettings}
                    visualTitleAndSubTitle={visualTitleAndSubTitle}
                />
            </div>
        );
    };

    return (
        <div className="h-full w-full overflow-hidden">
            {renderChart()}
        </div>
    );
};

export default React.memo(DashboardVisualItem);