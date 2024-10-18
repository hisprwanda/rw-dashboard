import React, { useEffect, useState } from 'react';
import Button from "../../components/Button";
import { IoSaveOutline } from 'react-icons/io5';
import { useDataSourceData } from '../../services/DataSourceHooks';
import { GenericModal, Loading } from "../../components";
import { DataModal, OrganizationModal, PeriodModal } from './Components/MetaDataModals';
import { useAuthorities } from '../../context/AuthContext';
import { LocalBarChart } from '../../components/charts/LocalBarChart';
import { LocalLineChart } from '../../components/charts/LocalLineChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import SelectChartType from './Components/SelectChartType';
import { IoBarChartSharp } from "react-icons/io5";
import { FaChartLine } from "react-icons/fa6";
import SaveVisualTypeForm from './Components/SaveVisualTypeForm';

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

function Visualizers() {
    const { data } = useDataSourceData();
    const { analyticsData, isFetchAnalyticsDataLoading } = useAuthorities();
    const [isShowDataModal, setIsShowDataModal] = useState(false);
    const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState(false);
    const [isShowPeriod, setIsShowPeriod] = useState(false);
    const [selectedChartType, setSelectedChartType] = useState(chartComponents[0]?.type); // Default to the first chart type
    const [isShowSaveVisualTypeForm,setIsShowSaveVisualTypeForm ] = useState<boolean>(false)

    const dataSourceOptions = data?.dataStore?.entries?.map((entry:any) => (
        <option key={entry?.key} value={entry?.key}>{entry?.value?.instanceName}</option>
    ));

    const handleShowSaveVisualTypeForm = ()=>{
        setIsShowSaveVisualTypeForm(true)
      }

    const handleShowDataModal = () => setIsShowDataModal(true);
    const handleShowOrganizationUnitModal = () => setIsShowOrganizationUnit(true);
    const handleShowPeriodModal = () => setIsShowPeriod(true);

    // Function to render the selected chart
    const renderChart = () => {
        const SelectedChart = chartComponents.find(chart => chart.type === selectedChartType)?.component;
        return SelectedChart ? <SelectedChart data={analyticsData} /> : null;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex justify-between items-start">
                <Tabs defaultValue="DATA" className="w-1/4 bg-white shadow-md rounded-lg p-4">
                    <TabsList className="flex items-center justify-center space-y-2">
                        <TabsTrigger
                            value="DATA"
                            className="text-lg font-semibold py-2 w-full text-left"
                        >
                            SELECT DATA
                        </TabsTrigger>
                        <TabsTrigger
                            value="CUSTOMIZE"
                            className="text-lg font-semibold py-2 w-full text-left hover:border-gray-300"
                        >
                            CHART TYPE
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="DATA" className="pt-4">
                        <div>
                            {/* Select Data Source Dropdown */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Data source</label>
                                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    {dataSourceOptions}
                                </select>
                            </div>
                            {/* Indicators */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <Button variant="source" text="Add +" onClick={handleShowDataModal} />
                            </div>
                            {/* Period */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                                <Button variant="source" text="Add +" onClick={handleShowPeriodModal} />
                            </div>
                            {/* Organization Unit */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Unit</label>
                                <Button variant="source" text="Add +" onClick={handleShowOrganizationUnitModal} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="CUSTOMIZE" className="pt-4">
                        <div>
                            {/* Customization Content */}
                            <SelectChartType 
                                chartComponents={chartComponents} 
                                selectedChartType={selectedChartType} 
                                setSelectedChartType={setSelectedChartType} 
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Visualization Area */}
                <div className="flex-grow bg-white shadow-md p-4 rounded-lg mx-4">
                    <div className="flex justify-end mb-4">
                        <Button variant="primary" text="Save" type="button" icon={<IoSaveOutline />}  onClick={handleShowSaveVisualTypeForm}/>
                    </div>
                    <div className="h-[600px] flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100">
                        {isFetchAnalyticsDataLoading ? (
                            <Loading />
                        ) : (
                            <div className="flex items-center justify-center w-full h-[600px]">
                                <div className="w-[100%] max-h-[100%]">
                                    {renderChart()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Data, Organization Unit, and Period Modals */}
            <GenericModal isOpen={isShowDataModal} setIsOpen={setIsShowDataModal}>
                <DataModal setIsShowDataModal={setIsShowDataModal} />
            </GenericModal>
            <GenericModal isOpen={isShowOrganizationUnit} setIsOpen={setIsShowOrganizationUnit}>
                <OrganizationModal setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
            </GenericModal>
            <GenericModal isOpen={isShowPeriod} setIsOpen={setIsShowPeriod}>
                <PeriodModal setIsShowPeriod={setIsShowPeriod} />
            </GenericModal>

            {/* save visual type form */}
            <GenericModal isOpen={isShowSaveVisualTypeForm} setIsOpen={setIsShowSaveVisualTypeForm}>
                <SaveVisualTypeForm setIsShowSaveVisualTypeForm={setIsShowSaveVisualTypeForm}  />
                </GenericModal>
        </div>
    );
}

export default Visualizers;
