import React, { useEffect, useState } from 'react'
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart'
import {  CircularLoader } from '@dhis2/ui';
import {chartComponents} from "../../../constants/systemCharts"
import {VisualSettingsTypes,VisualTitleAndSubtitleType} from "../../../types/visualSettingsTypes"


interface DashboardVisualItem {
    query:any;
    visualType: string;
    visualTitleAndSubTitle:VisualTitleAndSubtitleType;
    visualSettings: VisualSettingsTypes;
  
}

const DashboardVisualItem:React.FC<DashboardVisualItem> = ({query,visualType,visualSettings,visualTitleAndSubTitle}) => {
  console.log("hello query",query)


    const {data,error,loading} = useFetchSingleChartApi(query)


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
            return SelectedChart ? <SelectedChart data={data?.myData} visualSettings={visualSettings}  visualTitleAndSubTitle={visualTitleAndSubTitle}  /> : null;
        };
    

  // main dashboard  
  return (
    <div>
      {renderChart()}
    </div>
  )
}

export default DashboardVisualItem