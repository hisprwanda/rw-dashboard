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
import { useParams } from 'react-router-dom';
import { useFetchSingleVisualData } from '../../services/fetchVisuals';
import { unFormatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';
import { formatCurrentUserSelectedOrgUnit, formatSelectedOrganizationUnit,formatOrgUnitGroup,formatOrgUnitLevels} from '../../lib/formatCurrentUserOrgUnit';




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
    const { id:visualId } = useParams();

    const {data:singleSavedVisualData,isError,loading:isFetchSingleVisualLoading} = useFetchSingleVisualData(visualId)

    const { data,loading } = useDataSourceData();
    const { analyticsData, isFetchAnalyticsDataLoading,selectedChartType,setSelectedChartType,setAnalyticsQuery ,setAnalyticsDimensions,setIsSetPredifinedUserOrgUnits,isSetPredifinedUserOrgUnits,selectedOrganizationUnits,setSelectedOrganizationUnits,setIsUseCurrentUserOrgUnits,setSelectedOrgUnits,selectedOrgUnitGroups,setSelectedOrgUnitGroups,selectedOrganizationUnitsLevels ,setSelectedOrganizationUnitsLevels} = useAuthorities();
    const [isShowDataModal, setIsShowDataModal] = useState<boolean>(false);
    const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState<boolean>(false);
    const [isShowPeriod, setIsShowPeriod] = useState<boolean>(false);
    const [isShowSaveVisualTypeForm,setIsShowSaveVisualTypeForm ] = useState<boolean>(false)
    
    /// refine later (default dataSource visualId should be the current dhis2 instance)
    const [selectedDataSourceOption, setSelectedDataSourceOption] = useState<string>("");


    
    // initial render
    useEffect(()=>{
        setSelectedChartType(chartComponents[0]?.type)
    },[])
   
    useEffect(()=>{
        if(singleSavedVisualData)
        {
            setSelectedChartType(singleSavedVisualData?.dataStore?.visualType)
            setSelectedDataSourceOption(singleSavedVisualData?.dataStore?.dataSourceId)
            setAnalyticsQuery(singleSavedVisualData?.dataStore?.query)
            setAnalyticsDimensions(unFormatAnalyticsDimensions(singleSavedVisualData?.dataStore?.query?.myData?.params?.dimension))
          setIsSetPredifinedUserOrgUnits(formatCurrentUserSelectedOrgUnit(singleSavedVisualData?.dataStore?.query?.myData?.params?.filter))
          setSelectedOrganizationUnits(formatSelectedOrganizationUnit(singleSavedVisualData?.dataStore?.query?.myData?.params?.filter))
         setSelectedOrgUnits(singleSavedVisualData?.dataStore?.organizationTree)
         setSelectedOrgUnitGroups(formatOrgUnitGroup(singleSavedVisualData?.dataStore?.query?.myData?.params?.filter))
         setSelectedOrganizationUnitsLevels(formatOrgUnitLevels(singleSavedVisualData?.dataStore?.query?.myData?.params?.filter))
     
         // selectedOrgUnitGroups
          console.log("organizationTree 111",singleSavedVisualData?.dataStore?.query?.myData?.params?.filter)
            console.log("singleSavedVisualData levels max 777",formatOrgUnitLevels(singleSavedVisualData?.dataStore?.query?.myData?.params?.filter) )

        }
     
    },[singleSavedVisualData])

    // update if current user organization is selected
    useEffect(() =>{
     if(singleSavedVisualData)
     {
        const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(value => value === true);
        setIsUseCurrentUserOrgUnits(isAnyTrue);
     }

    },[isSetPredifinedUserOrgUnits])


    /// test selectedOrgUnits
    useEffect(()=>{
        //selectedOrgUnitGroups,setSelectedOrgUnitGroups
       console.log("selectedOrganizationUnitsLevels simba",selectedOrganizationUnitsLevels )
    },[selectedOrganizationUnitsLevels])



    //// data source options
    const dataSourceOptions = data?.dataStore?.entries?.map((entry:any) => (
        <option key={entry?.key} value={entry?.key}>{entry?.value?.instanceName}</option>
    ));

    const handleShowSaveVisualTypeForm = ()=>{
        setIsShowSaveVisualTypeForm(true)
      }
     //// function to handle show modals
    const handleShowDataModal = () => setIsShowDataModal(true);
    const handleShowOrganizationUnitModal = () => setIsShowOrganizationUnit(true);
    const handleShowPeriodModal = () => setIsShowPeriod(true);


    // Function to render the selected chart
    const renderChart = () => {
        const SelectedChart = chartComponents.find(chart => chart.type === selectedChartType)?.component;
        return SelectedChart ? <SelectedChart data={analyticsData} /> : null;
    };

    /// handle data source onchange
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDataSourceOption(e.target.value);
      };


    /// main return
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            { (isFetchSingleVisualLoading || loading) ? <Loading/> : 
            <>
                    <div className="flex justify-between items-start">
                <Tabs defaultValue="DATA" className="w-1/4 bg-white shadow-md rounded-lg p-4">
                    <TabsList className="flex items-center justify-center ">
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
                                <select   value={selectedDataSourceOption} onChange={handleChange}
         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
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
                        <Button variant="primary" text={visualId  ? "Update" : "Save" } type="button" icon={<IoSaveOutline />}  onClick={handleShowSaveVisualTypeForm}/>
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
                <OrganizationModal singleSavedVisualData={singleSavedVisualData}  setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
            </GenericModal>
            <GenericModal isOpen={isShowPeriod} setIsOpen={setIsShowPeriod}>
                <PeriodModal setIsShowPeriod={setIsShowPeriod} />
            </GenericModal>

            {/* save visual type form */}
            <GenericModal isOpen={isShowSaveVisualTypeForm} setIsOpen={setIsShowSaveVisualTypeForm}>
                <SaveVisualTypeForm  visualId={visualId}  singleSavedVisualData={singleSavedVisualData} setIsShowSaveVisualTypeForm={setIsShowSaveVisualTypeForm } selectedChartType={selectedChartType}  selectedDataSourceId={selectedDataSourceOption} />
                </GenericModal>
            </>
            }
    
        </div>
    );
}

export default Visualizers;
