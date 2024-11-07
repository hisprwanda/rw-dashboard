import { LocalBarChart } from '../components/charts/LocalBarChart';
import { LocalLineChart } from '../components/charts/LocalLineChart';
import { IoBarChartSharp } from 'react-icons/io5';
import { FaChartLine } from 'react-icons/fa';

type ChartProps = {
    data: any;
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
    { 
        type: 'line', 
        component: LocalLineChart, 
        description: 'A line chart showing trends over time', 
        icon: <FaChartLine /> 
    },
];
