import React, { useCallback, useEffect, useState } from 'react'
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart'
import {  CircularLoader } from '@dhis2/ui';
import {chartComponents} from "../../../constants/systemCharts"
import {VisualSettingsTypes,VisualTitleAndSubtitleType} from "../../../types/visualSettingsTypes"
import { useAuthorities } from '../../../context/AuthContext';
import { currentInstanceId } from '../../../constants/currentInstanceInfo';
import { useDataSourceData } from '../../../services/DataSourceHooks';
import { useExternalAnalyticsData } from '../../../services/useFetchExternalAnalytics';


interface DashboardVisualItem {
    query:any;
    visualType: string;
    visualTitleAndSubTitle:VisualTitleAndSubtitleType;
    visualSettings: VisualSettingsTypes;
    dataSourceId:string
  
}

const DashboardVisualItem:React.FC<DashboardVisualItem> = ({query,visualType,visualSettings,visualTitleAndSubTitle,dataSourceId}) => {
  
    const {data,error,loading,runSavedSingleVisualAnalytics} = useFetchSingleChartApi(query)
    const {fetchExternalAnalyticsData} = useExternalAnalyticsData()
    const {resultOfSavedSingleVisual,setResultOfSavedSingleVisual} =   useAuthorities()
    const { data: savedDataSource } = useDataSourceData();

// =================================================================
const [tempDataSource, setTempDataSource] = useState<{ isCurrentInstance: boolean; url: string; token: string } | null>(null);

     /**
     * Function to determine the current data source details.
     */
    const determineDataSource = useCallback(() => {
      if (dataSourceId === currentInstanceId) {
          // Handle the current instance
          const currentInstanceDetails = {
              isCurrentInstance: true,
              url: '', 
              token: '',
          };
          setTempDataSource(currentInstanceDetails);
      } else {
          // Find the details for the selected data source
          const selectedDataSourceDetails = savedDataSource?.dataStore?.entries?.find(
              (item: any) => item.key === dataSourceId
          )?.value;

          setTempDataSource(selectedDataSourceDetails || null);
      }
  }, [dataSourceId, savedDataSource]);

  useEffect(() => {
    determineDataSource();
}, [dataSourceId, savedDataSource]); 

  useEffect(()=>{
    console.log("tempDataSource",tempDataSource)
  },[tempDataSource])


// =================================================================



const fetchData = useCallback(() => {
  if (tempDataSource?.isCurrentInstance) {
      runSavedSingleVisualAnalytics();
  } else if (tempDataSource?.token && tempDataSource?.url) {
      fetchExternalAnalyticsData(query, tempDataSource.token, tempDataSource.url);
  }
}, [tempDataSource, query, runSavedSingleVisualAnalytics, fetchExternalAnalyticsData]);

useEffect(() => {
  fetchData();
}, [fetchData]);



     useEffect(()=>{
      console.log("resultOfSavedSingleVisual",resultOfSavedSingleVisual)
     },[resultOfSavedSingleVisual])
    
    if(loading)
    {
        return <CircularLoader/>
    }
    if(error)
    {
        return <p>Error: {error.message}</p>
    }
        // Function to render the selected chart
        const renderChart = () => {
            const SelectedChart = chartComponents.find(chart => chart.type === visualType)?.component;
            return SelectedChart ? <SelectedChart data={resultOfSavedSingleVisual?.myData} visualSettings={visualSettings}  visualTitleAndSubTitle={visualTitleAndSubTitle}  /> : null;
        };
    

  // main dashboard  
  return (
    <div>
      {renderChart()}
    </div>
  )
}

export default DashboardVisualItem