import React, { useEffect, useState } from 'react'
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart'
import {  CircularLoader } from '@dhis2/ui';
import {chartComponents} from "../../../constants/systemCharts"
import {VisualSettingsTypes,VisualTitleAndSubtitleType} from "../../../types/visualSettingsTypes"
import { useAuthorities } from '../../../context/AuthContext';


interface DashboardVisualItem {
    query:any;
    visualType: string;
    visualTitleAndSubTitle:VisualTitleAndSubtitleType;
    visualSettings: VisualSettingsTypes;
    dataSourceId:string
  
}

const DashboardVisualItem:React.FC<DashboardVisualItem> = ({query,visualType,visualSettings,visualTitleAndSubTitle,dataSourceId}) => {

    const {data,error,loading,runSavedSingleVisualAnalytics} = useFetchSingleChartApi(query)
    const {resultOfSavedSingleVisual,setResultOfSavedSingleVisual} =   useAuthorities()


     useEffect(()=>{
            runSavedSingleVisualAnalytics()
     },[])
    
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