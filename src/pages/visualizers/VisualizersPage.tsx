import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from "../../components/Button";
import { IoSaveOutline } from 'react-icons/io5';
import { useDataSourceData } from '../../services/DataSourceHooks';
import { GenericModal, Loading } from "../../components";
import { DataModal, OrganizationModal, PeriodModal } from './Components/MetaDataModals';
import { useAuthorities } from '../../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import SelectChartType from './Components/SelectChartType';
import { IoBarChartSharp } from "react-icons/io5";
import { FaChartLine } from "react-icons/fa6";
import SaveVisualTypeForm from './Components/SaveVisualTypeForm';
import { useParams } from 'react-router-dom';
import { useFetchSingleVisualData } from '../../services/fetchVisuals';
import { unFormatAnalyticsDimensions ,formatAnalyticsDimensions} from '../../lib/formatAnalyticsDimensions';
import { formatCurrentUserSelectedOrgUnit, formatSelectedOrganizationUnit,formatOrgUnitGroup,formatOrgUnitLevels} from '../../lib/formatCurrentUserOrgUnit';
import { useOrgUnitData } from '../../services/fetchOrgunitData';
import { useDataItems } from '../../services/fetchDataItems';
import {chartComponents} from "../../constants/systemCharts"
import { IoIosOptions } from "react-icons/io";
import GeneralChartsStyles from './Components/GeneralChartsOptions';
import { NavigationMenuDemo } from './Components/ChartsMenu';
import VisualSettings from './Components/VisualSettings';
import {systemDefaultColorPalettes} from "../../constants/colorPalettes";
import { useExternalDataItems } from '../../services/useExternalDataItems';
import { useSystemInfo } from '../../services/fetchSystemInfo';
import { useExternalOrgUnitData } from '../../services/fetchExternalOrgUnit';
import { currentInstanceId } from '../../constants/currentInstanceInfo';
import debounce from 'lodash/debounce';
import { dimensionItemTypes } from '../../constants/dimensionItemTypes';


function Visualizers() {
    const { id:visualId } = useParams();
    const {  data:systemInfo } = useSystemInfo();
    const {  setDataItemsDataPage,dataItemsDataPage,selectedDataSourceOption,setSelectedDataSourceOption,currentUserInfoAndOrgUnitsData,setCurrentUserInfoAndOrgUnitsData, dataItemsData,selectedDataSourceDetails,setSelectedDataSourceDetails,setSelectedDimensionItemType,analyticsData, isFetchAnalyticsDataLoading,selectedChartType,setSelectedChartType,setAnalyticsQuery ,isUseCurrentUserOrgUnits,analyticsQuery,analyticsDimensions,setAnalyticsDimensions,setIsSetPredifinedUserOrgUnits,isSetPredifinedUserOrgUnits,selectedOrganizationUnits,setSelectedOrganizationUnits,setIsUseCurrentUserOrgUnits,selectedOrgUnits,setSelectedOrgUnits,selectedOrgUnitGroups,setSelectedOrgUnitGroups,selectedOrganizationUnitsLevels ,setSelectedOrganizationUnitsLevels,selectedLevel,setSelectedLevel,fetchAnalyticsData,setAnalyticsData,fetchAnalyticsDataError,setSelectedVisualTitleAndSubTitle,visualTitleAndSubTitle,visualSettings,setSelectedVisualSettings,setVisualsColorPalettes,selectedColorPalette,selectedDimensionItemType} = useAuthorities();
    const {data:singleSavedVisualData,isError,loading:isFetchSingleVisualLoading} = useFetchSingleVisualData(visualId)
    const { loading:orgUnitLoading, error:fetchOrgUnitError, data:orgUnitsData,fetchCurrentUserInfoAndOrgUnitData } = useOrgUnitData();
    const {  error:dataItemsFetchError, loading:isFetchCurrentInstanceDataItemsLoading,fetchCurrentInstanceData } = useDataItems();
    const {fetchExternalDataItems,response,error,loading:isFetchExternalInstanceDataItemsLoading} = useExternalDataItems()
    const {fetchExternalUserInfoAndOrgUnitData} = useExternalOrgUnitData()
    const defaultUserOrgUnit = currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName
    const { data:savedDataSource,loading } = useDataSourceData();
      const [isShowDataModal, setIsShowDataModal] = useState<boolean>(false);
    const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState<boolean>(false);
    const [isShowPeriod, setIsShowPeriod] = useState<boolean>(false);
    const [isShowSaveVisualTypeForm,setIsShowSaveVisualTypeForm ] = useState<boolean>(false)
    const [isShowStyles,setIsShowStyles ] = useState<boolean>(false)
    const selectedDataSourceDetailsRef = useRef(selectedDataSourceDetails);
    const [titleOption, setTitleOption] = useState< 'none' | 'custom'>('none');
    const [subtitleOption, setSubtitleOption] = useState<'auto' | 'none' | 'custom'>('auto');
    //// data source options
    const dataSourceOptions = savedDataSource?.dataStore?.entries?.map((entry:any) => (
        <option key={entry?.key} value={entry?.key}>{entry?.value?.instanceName}</option>
    ));


    /// function to clear reset to default values
     function resetToDefaultValues() {
        setSelectedDimensionItemType(dimensionItemTypes[0])
        setSelectedDataSourceDetails({
            instanceName: systemInfo?.title?.applicationTitle || "", // Fallback to an empty string if undefined
            isCurrentInstance: true,
          })
         setAnalyticsData(null)
        setSelectedChartType(chartComponents[0]?.type)
        setAnalyticsQuery(null)
        setAnalyticsDimensions({ dx: [], pe: ['LAST_12_MONTHS'] })
        setIsSetPredifinedUserOrgUnits({
            is_USER_ORGUNIT: true,
            is_USER_ORGUNIT_CHILDREN: false,
            is_USER_ORGUNIT_GRANDCHILDREN: false
          })
          setIsUseCurrentUserOrgUnits(true)
        setSelectedOrganizationUnits([])
        setSelectedOrgUnits([])
        setSelectedOrgUnitGroups([])
        setSelectedOrganizationUnitsLevels([])
        setSelectedLevel([])
        setSelectedVisualTitleAndSubTitle((prev)=>{
            return {
                ...prev,
                 visualTitle:  "",
                    DefaultSubTitle: [defaultUserOrgUnit],
                    customSubTitle:""
            }
        })
         setVisualsColorPalettes(systemDefaultColorPalettes[0] || [])
            setSelectedVisualSettings({ backgroundColor: '#ffffff',visualColorPalette:selectedColorPalette,fillColor:"#ffffff",XAxisSettings:{color:"#000000",fontSize:12},YAxisSettings:{color:"#000000",fontSize:12} })
            setSelectedDataSourceOption(currentInstanceId)
     }
     ///
     function resetOtherValuesToDefaultExceptDataSource() {
        setSelectedDimensionItemType(dimensionItemTypes[0])
         setAnalyticsData(null)
        setSelectedChartType(chartComponents[0]?.type)
        setAnalyticsQuery(null)
        setAnalyticsDimensions({ dx: [], pe: ['LAST_12_MONTHS'] })
        setIsSetPredifinedUserOrgUnits({
            is_USER_ORGUNIT: true,
            is_USER_ORGUNIT_CHILDREN: false,
            is_USER_ORGUNIT_GRANDCHILDREN: false
          })
          setIsUseCurrentUserOrgUnits(true)
        setSelectedOrganizationUnits([])
        setSelectedOrgUnits([])
        setSelectedOrgUnitGroups([])
        setSelectedOrganizationUnitsLevels([])
        setSelectedLevel([])
        setSelectedVisualTitleAndSubTitle((prev)=>{
            return {
                ...prev,
                 visualTitle:  "",
                    DefaultSubTitle: [defaultUserOrgUnit],
                    customSubTitle:""
            }
        })
         setVisualsColorPalettes(systemDefaultColorPalettes[0] || [])
            setSelectedVisualSettings({ backgroundColor: '#ffffff',visualColorPalette:selectedColorPalette,fillColor:"#ffffff",XAxisSettings:{color:"#000000",fontSize:12},YAxisSettings:{color:"#000000",fontSize:12} })
          
     }


    // if visualId is false then set all chart related states to default
    useEffect(()=>{
        if(!visualId)
        {
            resetToDefaultValues() 
          /// if no visual created , fetch data of current instance
          fetchCurrentInstanceData(selectedDimensionItemType);
          fetchCurrentUserAndOrgUnitData();
        }
       
    },[visualId])

    //// run analytics API
    const debounceRunAnalytics = useCallback(debounce(() => {
        if (singleSavedVisualData && visualId) {
            keepUpWithSelectedDataSource();
            setAnalyticsData([]); 
            fetchAnalyticsData(
                formatAnalyticsDimensions(analyticsDimensions),
                selectedDataSourceDetails
            );
        }
    }, 500), [analyticsDimensions, singleSavedVisualData, visualId]);
    
    useEffect(() => {
        debounceRunAnalytics();
        return debounceRunAnalytics.cancel; // Cleanup debounce on unmount
    }, [debounceRunAnalytics]);
    


    

    

    // update if current user organization is selected
    useEffect(() =>{
     if(singleSavedVisualData)
     {
        const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(value => value === true);
        setIsUseCurrentUserOrgUnits(isAnyTrue);
     }

    },[isSetPredifinedUserOrgUnits])

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
        return SelectedChart ? <SelectedChart data={analyticsData} visualTitleAndSubTitle={visualTitleAndSubTitle} visualSettings={visualSettings}   /> : null;
    };

    /// handle data source onchange
    const handleDataSourceOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        console.log("data source selected changed");
    
        // Step 1: Update selected data source option
        setSelectedDataSourceOption(selectedValue);
    
        // Step 2: Reset states *only* after updating selected data source details
        let newSelectedDetails = {};
    
        if (selectedValue === currentInstanceId) { 
            newSelectedDetails = {
                instanceName: systemInfo?.title?.applicationTitle || "", 
                isCurrentInstance: true,
            };

            fetchCurrentInstanceData(selectedDimensionItemType);
            fetchCurrentUserAndOrgUnitData();
        } else {
            newSelectedDetails = savedDataSource?.dataStore?.entries?.find(
                (item) => item.key === selectedValue
            )?.value || {};

            fetchExternalDataItems(newSelectedDetails.url, newSelectedDetails.token,selectedDimensionItemType);
            fetchExternalUserInfoAndOrgUnitData(newSelectedDetails.url, newSelectedDetails.token);

        }
    
        // Step 3: Update details and reset default values *afterwards*
        setSelectedDataSourceDetails(newSelectedDetails);
        resetOtherValuesToDefaultExceptDataSource() 
    
    };
    
    
/// fetch current user and Organization unit
    const fetchCurrentUserAndOrgUnitData = async () => {
        const result = await fetchCurrentUserInfoAndOrgUnitData(); 
        setCurrentUserInfoAndOrgUnitsData(result); 
      };
      
// keepUp with selected data source

function keepUpWithSelectedDataSource() {
    const details = selectedDataSourceDetailsRef.current;

    if (!details) return;

    // Proceed with using the latest `details`
    if (details.isCurrentInstance) {
        fetchCurrentInstanceData(selectedDimensionItemType);
        fetchCurrentUserAndOrgUnitData();
    } else if (details.url && details.token) {
        fetchExternalDataItems(details.url, details.token,selectedDimensionItemType);
        fetchExternalUserInfoAndOrgUnitData(details.url, details.token);
    } else {
        console.error("Invalid data source details: Missing URL or token.");
    }
}





useEffect(() => {
   
    selectedDataSourceDetailsRef.current = selectedDataSourceDetails;
       // reset to page one
       setDataItemsDataPage(1)
}, [selectedDataSourceDetails]);


/// handle selectedDimensionItemType onChange 
//  useEffect(()=>{
   
//     if(selectedDataSourceDetails.isCurrentInstance)
//     {
//         fetchCurrentInstanceData(selectedDimensionItemType,1);
//     }
//     else {
//         fetchExternalDataItems(selectedDataSourceDetails.url, selectedDataSourceDetails.token,selectedDimensionItemType,1);
//     }
  
//  },[selectedDimensionItemType])
 



   //// testing data items
   useEffect(()=>{
    console.log("here is updated data items",dataItemsData)
  },[dataItemsData])

 

 



    /// main return
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            
    <div>
             
                <h3>Test Total: {dataItemsData?.pager?.total}</h3>
            </div>
            { (isFetchSingleVisualLoading || loading) ? <Loading/> : 
            <>
                    <div className="flex justify-between items-start">
                <Tabs defaultValue="DATA" className="w-1/4 bg-white shadow-md rounded-lg p-4">
                    <TabsList className="flex items-center justify-center ">
                        <TabsTrigger
                            value="DATA"
                            className="text-lg font-semibold py-2 w-full text-left"
                        >
                            DIMENSIONS
                        </TabsTrigger>
                        <TabsTrigger
                            value="SETTINGS"
                            className="text-lg font-semibold py-2 w-full text-left hover:border-gray-300"
                        >
                            SETTINGS
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="DATA" className="pt-4">
                        <div>
                            {/* Select Data Source Dropdown */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Data source</label>
                                <select   value={selectedDataSourceOption} onChange={handleDataSourceOnChange}
         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                   <option value={currentInstanceId}  >{ systemInfo?.title?.applicationTitle}</option>
                                    {dataSourceOptions}
                                </select>
                            </div>
                            {/* Indicators */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading ) ? "Loading.." : "Add +"} `} onClick={handleShowDataModal} />
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
                    <TabsContent value="SETTINGS" className="pt-4">
                   <VisualSettings setIsShowStyles={setIsShowStyles} />
                    </TabsContent>
                </Tabs>

                {/* Visualization Area */}
                <div className="flex-grow bg-white shadow-md p-4 rounded-lg mx-4">
                    <div className="flex justify-between mb-4 gap-1 ">
                    <div className='' >
                        {/* this co */}
                    <SelectChartType 
                                chartComponents={chartComponents} 
                                selectedChartType={selectedChartType} 
                                setSelectedChartType={setSelectedChartType} 
                            />
                    </div>
              
                            <div>
                            <Button variant="primary" text={visualId  ? "Update" : "Save" } type="button" icon={<IoSaveOutline />}  onClick={handleShowSaveVisualTypeForm}/>
                            </div>
                       
                    </div>
                    <div className="h-[600px] flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100">
                        {isFetchAnalyticsDataLoading ? (
                            <Loading />
                        ) : (
                            <div className="flex items-center justify-center w-full h-[600px]">
                                <div className="w-[100%] max-h-[100%]">
                                     { fetchAnalyticsDataError ?
                                      <p className='text-center text-red-600 bg-red-100 p-4 rounded-lg shadow-sm border border-red-300'  >{fetchAnalyticsDataError?.message}</p> :
                                       renderChart()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Data, Organization Unit, and Period Modals */}
            <GenericModal isOpen={isShowDataModal} setIsOpen={setIsShowDataModal}>
                <DataModal  data={dataItemsData} loading={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} error={dataItemsFetchError}  setIsShowDataModal={setIsShowDataModal} />
            </GenericModal>
            <GenericModal isOpen={isShowOrganizationUnit} setIsOpen={setIsShowOrganizationUnit}>
                <OrganizationModal  data={currentUserInfoAndOrgUnitsData}  loading={orgUnitLoading} error={fetchOrgUnitError} setIsShowOrganizationUnit={setIsShowOrganizationUnit}  />
            </GenericModal>
            <GenericModal isOpen={isShowPeriod} setIsOpen={setIsShowPeriod}>
                <PeriodModal setIsShowPeriod={setIsShowPeriod} />
            </GenericModal>

            {/* save visual type form */}
            <GenericModal isOpen={isShowSaveVisualTypeForm} setIsOpen={setIsShowSaveVisualTypeForm}>
                <SaveVisualTypeForm  visualId={visualId}  singleSavedVisualData={singleSavedVisualData} setIsShowSaveVisualTypeForm={setIsShowSaveVisualTypeForm } selectedChartType={selectedChartType}  selectedDataSourceId={selectedDataSourceOption} />
                </GenericModal>
                {/* general charts option */}
            <GenericModal isOpen={isShowStyles} setIsOpen={setIsShowStyles}>
               <GeneralChartsStyles  setIsShowStyles={setIsShowStyles} titleOption={titleOption} setTitleOption={setTitleOption} subtitleOption={subtitleOption} setSubtitleOption={setSubtitleOption} />
                </GenericModal>
            </>
            }
    
        </div>
    );
}

export default Visualizers;
