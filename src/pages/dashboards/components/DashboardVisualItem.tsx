import React, { useEffect, useState } from 'react'
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart'
import {  CircularLoader } from '@dhis2/ui';
import {chartComponents} from "../../../constants/systemCharts"


interface DashboardVisualItem {
    query?:any;
    visualType: string;
}

const DashboardVisualItem:React.FC<DashboardVisualItem> = ({query,visualType}) => {
  console.log("hello query",query)

//   const testQuery =  {
//     "myData": {
//         "params": {
//             "filter": "ou:USER_ORGUNIT",
//             "dimension": [
//                 "dx:zzeruEiEtWK",
//                 "pe:LAST_12_MONTHS"
//             ],
//             "includeNumDen": true,
//             "displayProperty": "NAME"
//         },
//         "resource": "analytics"
//     }
// }

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
            return SelectedChart ? <SelectedChart data={data?.myData} /> : null;
        };
    

  // main dashboard  
  return (
    <div>
      {renderChart()}
   
    </div>
  )
}

export default DashboardVisualItem