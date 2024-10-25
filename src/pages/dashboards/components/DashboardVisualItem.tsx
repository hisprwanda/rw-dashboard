import React, { useEffect, useState } from 'react'
import { useFetchSingleChartApi } from '../../../services/fetchSingleChart'
import { LocalBarChart } from '../../../components/charts/LocalBarChart';
import { LocalLineChart } from '../../../components/charts/LocalLineChart';
import { IoBarChartSharp } from 'react-icons/io5'
import { FaChartLine } from 'react-icons/fa'


interface DashboardVisualItem {
    query?:any;
    visualType: string;
}

const DashboardVisualItem:React.FC<DashboardVisualItem> = ({query,visualType}) => {


    console.log("hello visual type",visualType)

    const   queryTest = {
        "myData": {
            "params": {
                "filter": "ou:USER_ORGUNIT",
                "dimension": [
                    "dx:GKqY2oyD2JB;zzeruEiEtWK",
                    "pe:LAST_12_MONTHS"
                ],
                "includeNumDen": true,
                "displayProperty": "NAME"
            },
            "resource": "analytics"
        }
    }
    const {data,error,loading} = useFetchSingleChartApi(query)

    const chartComponents = [
        { 
            type: 'bar', 
            component: LocalBarChart, 
            description: 'A bar chart displaying data', 
            icon: <IoBarChartSharp /> 
        },
        { 
            type: 'line', 
            component: LocalLineChart, 
            description: 'A line chart showing trends over time', 
            icon: <FaChartLine /> 
        },
    ];


    if(loading)
    {
        return <p>Loading...</p>
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