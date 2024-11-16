import { LocalBarChart } from '../components/charts/LocalBarChart';
import { LocalLineChart } from '../components/charts/LocalLineChart';
import { LocalAreaChart } from '../components/charts/LocalAreaChart';
import { LocalRadarChart } from '../components/charts/LocalRadarChart';
import { IoBarChartSharp } from 'react-icons/io5';
import { FaChartLine ,FaChartArea} from 'react-icons/fa';
import { FaChartSimple } from 'react-icons/fa6';
import {VisualSettingsTypes,VisualTitleAndSubtitleType} from "../types/visualSettingsTypes"

type ChartProps = {
    data: any;
    visualTitleAndSubTitle:VisualTitleAndSubtitleType;
    visualSettings:VisualSettingsTypes

};

type ChartComponent = {
    type: string;
    component: React.FC<ChartProps>;
    description: string;
    icon: JSX.Element;
}[];

export const chartComponents: ChartComponent = [
    { 
        type: 'bar', 
        component: LocalBarChart, 
        description: 'A bar chart displaying data', 
        icon: <IoBarChartSharp /> 
    },
    // { 
    //     type: 'area', 
    //     component: LocalAreaChart, 
    //     description: 'A line chart showing trends over time', 
    //     icon: <FaChartArea /> 
    // },
    // { 
    //     type: 'line', 
    //     component: LocalLineChart, 
    //     description: 'A line chart showing trends over time', 
    //     icon: <FaChartLine /> 
    // },
    // // change icon later
    // { 
    //     type: 'radar', 
    //     component: LocalRadarChart, 
    //     description: 'A line chart showing trends over time', 
    //     icon: <FaChartSimple /> 
    // },
  
  
];
