import { LocalBarChart } from '../components/charts/LocalBarChart';
import { LocalLineChart } from '../components/charts/LocalLineChart';
import { LocalAreaChart } from '../components/charts/LocalAreaChart';
import { LocalRadarChart } from '../components/charts/LocalRadarChart';
import { LocalStackedBar } from '../components/charts/LocalStackedBar';
import { LocalRowBarChart } from '../components/charts/LocalRowBarChart';
import { LocalRowStackedChart } from '../components/charts/LocalRowStackedChart';
import { LocalScatterCharts } from '../components/charts/LocalScatterCharts';
import { LocalPieChart } from '../components/charts/LocalPieChart';
import { LocalRadialChat } from '../components/charts/LocalRadialChat';
import { LocalTableVisual } from '../components/charts/LocalTableVisual';
import { LocalSingleValue } from '../components/charts/LocalSingleValue';
import { LocalTreeMapChart } from '../components/charts/LocalTreeMapChart';
import { IoBarChartSharp, IoPieChart } from 'react-icons/io5';
import { FaChartLine ,FaChartArea} from 'react-icons/fa';
import { FaChartSimple } from 'react-icons/fa6';
import {VisualSettingsTypes,VisualTitleAndSubtitleType} from "../types/visualSettingsTypes"
import { FaTableCells } from "react-icons/fa6";
import { VscListTree } from "react-icons/vsc";
import { RxValue } from "react-icons/rx";
import { TbChartRadar } from "react-icons/tb";
import { PiChartScatterDuotone } from "react-icons/pi";
import { GiRadialBalance } from "react-icons/gi";
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
        type: 'Column', 
        component: LocalBarChart, 
        description: 'A bar chart displaying data', 
        icon: <IoBarChartSharp /> 
    },
    { 
        type: 'Table', 
        component: LocalTableVisual, 
        description: 'A bar chart displaying data', 
        icon: <FaTableCells /> 
    },

    { 
        type: 'Stacked Col', 
        component: LocalStackedBar, 
        description: 'A bar chart displaying data', 
        icon: <IoBarChartSharp /> 
    },
    { 
        type: 'Bar', 
        component: LocalRowBarChart, 
        description: 'A bar chart displaying data', 
        icon: <IoBarChartSharp /> 
    },
    { 
        type: 'Stacked Bar', 
        component: LocalRowStackedChart, 
        description: 'A bar chart displaying data', 
        icon: <IoBarChartSharp /> 
    },
    { 
        type: 'Line', 
        component: LocalLineChart, 
        description: 'A line chart showing trends over time', 
        icon: <FaChartLine /> 
    },
    { 
        type: 'Area', 
        component: LocalAreaChart, 
        description: 'A line chart showing trends over time', 
        icon: <FaChartArea /> 
    },
    { 
        type: 'Pie', 
        component: LocalPieChart, 
        description: 'A bar chart displaying data', 
        icon: <IoPieChart /> 
    },  
    { 
        type: 'Radial', 
        component: LocalRadialChat, 
        description: 'A bar chart displaying data', 
        icon: <GiRadialBalance /> 
    },
    { 
        type: 'Tree Map', 
        component: LocalTreeMapChart, 
        description: 'A bar chart displaying data', 
        icon: <VscListTree /> 
    },
    { 
        type: 'Single Value', 
        component: LocalSingleValue, 
        description: 'A bar chart displaying data', 
        icon: <RxValue /> 
    },
    { 
        type: 'Radar', 
        component: LocalRadarChart, 
        description: 'A line chart showing trends over time', 
        icon: <TbChartRadar /> 
    },  
    { 
        type: 'Scatter', 
        component: LocalScatterCharts, 
        description: 'A line chart showing trends over time', 
        icon: <PiChartScatterDuotone /> 
    }, 
  
];
