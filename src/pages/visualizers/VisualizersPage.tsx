import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from "../../components/Button";
import { IoSaveOutline } from 'react-icons/io5';
import { TiExport } from "react-icons/ti";
import {FileActionMenu} from "./Components/FileActionMenu"
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
import { unFormatAnalyticsDimensions, formatAnalyticsDimensions } from '../../lib/formatAnalyticsDimensions';
import { formatCurrentUserSelectedOrgUnit, formatSelectedOrganizationUnit, formatOrgUnitGroup, formatOrgUnitLevels } from '../../lib/formatCurrentUserOrgUnit';
import { useOrgUnitData } from '../../services/fetchOrgunitData';
import { useDataItems } from '../../services/fetchDataItems';
import { chartComponents } from "../../constants/systemCharts";
import { IoIosOptions } from "react-icons/io";
import GeneralChartsStyles from './Components/GeneralChartsOptions';
import { NavigationMenuDemo } from './Components/ChartsMenu';
import VisualSettings from './Components/VisualSettings';
import { systemDefaultColorPalettes } from "../../constants/colorPalettes";
import { useExternalDataItems } from '../../services/useExternalDataItems';
import { useSystemInfo } from '../../services/fetchSystemInfo';
import { useExternalOrgUnitData } from '../../services/fetchExternalOrgUnit';
import { currentInstanceId } from '../../constants/currentInstanceInfo';
import debounce from 'lodash/debounce';
import { dimensionItemTypes } from '../../constants/dimensionItemTypes';
import ExportModal from './Components/ExportModal';
import { useToast } from "../../components/ui/use-toast";
import { Maximize2 } from 'lucide-react';
import i18n from '../../locales/index.js'
import { useResetAnalyticsStatesToDefault } from '../../hooks/useResetAnalyticsStatesTDefault';
import FilteringVisualsDragAndDrop from './Components/FilteringVisuals/FilteringVisualsDragAndDrop';

function Visualizers() {
    const { id: visualId } = useParams();
    const { data: systemInfo } = useSystemInfo();
    const { subDataItemsData, setDataItemsDataPage, dataItemsDataPage, selectedDataSourceOption, setSelectedDataSourceOption, currentUserInfoAndOrgUnitsData, setCurrentUserInfoAndOrgUnitsData, dataItemsData, selectedDataSourceDetails, setSelectedDataSourceDetails, setSelectedDimensionItemType, analyticsData, isFetchAnalyticsDataLoading, selectedChartType, setSelectedChartType, setAnalyticsQuery, isUseCurrentUserOrgUnits, analyticsQuery, analyticsDimensions, setAnalyticsDimensions, setIsSetPredifinedUserOrgUnits, isSetPredifinedUserOrgUnits, selectedOrganizationUnits, setSelectedOrganizationUnits, setIsUseCurrentUserOrgUnits, selectedOrgUnits, setSelectedOrgUnits, selectedOrgUnitGroups, setSelectedOrgUnitGroups, selectedOrganizationUnitsLevels, setSelectedOrganizationUnitsLevels, selectedLevel, setSelectedLevel, fetchAnalyticsData, setAnalyticsData, fetchAnalyticsDataError, setSelectedVisualTitleAndSubTitle, visualTitleAndSubTitle, visualSettings, setSelectedVisualSettings, setVisualsColorPalettes, selectedColorPalette, selectedDimensionItemType } = useAuthorities();
    const { data: singleSavedVisualData, isError, loading: isFetchSingleVisualLoading } = useFetchSingleVisualData(visualId);
    const { loading: orgUnitLoading, error: fetchOrgUnitError, data: orgUnitsData, fetchCurrentUserInfoAndOrgUnitData } = useOrgUnitData();
    const { error: dataItemsFetchError, loading: isFetchCurrentInstanceDataItemsLoading, fetchCurrentInstanceData } = useDataItems();
    const { fetchExternalDataItems, response, error, loading: isFetchExternalInstanceDataItemsLoading } = useExternalDataItems();
    const { fetchExternalUserInfoAndOrgUnitData, loading: isFetchExternalUserInfoAndOrgUnitDataLoading } = useExternalOrgUnitData();
    const defaultUserOrgUnit = currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName;
    const { data: savedDataSource, loading } = useDataSourceData();
    const [isShowDataModal, setIsShowDataModal] = useState<boolean>(false);
    const [isShowExportModal, setIsShowExportModal] = useState<boolean>(false);
    const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState<boolean>(false);
    const [isShowPeriod, setIsShowPeriod] = useState<boolean>(false);
    const [isShowSaveVisualTypeForm, setIsShowSaveVisualTypeForm] = useState<boolean>(false);
    const [isShowStyles, setIsShowStyles] = useState<boolean>(false);
    const selectedDataSourceDetailsRef = useRef(selectedDataSourceDetails);
    const [titleOption, setTitleOption] = useState<'none' | 'custom'>('none');
    const [subtitleOption, setSubtitleOption] = useState<'auto' | 'none' | 'custom'>('auto');
    const visualizationRef = useRef<HTMLDivElement>(null);
    const captureRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const {resetOtherValuesToDefaultExceptDataSource,resetAnalyticsStatesToDefaultValues} = useResetAnalyticsStatesToDefault()

    //// data source options
    const dataSourceOptions = savedDataSource?.dataStore?.entries?.map((entry: any) => (
        <option key={entry?.key} value={entry?.key}>{entry?.value?.instanceName}</option>
    ));
    // if visualId is false then set all chart related states to default
    useEffect(() => {
        if (!visualId) {
            resetAnalyticsStatesToDefaultValues();
            /// if no visual created , fetch data of current instance
            fetchCurrentInstanceData(selectedDimensionItemType);
            fetchCurrentUserAndOrgUnitData();
        }

    }, [visualId]);

    // update if current user organization is selected
    useEffect(() => {
        if (singleSavedVisualData) {
            const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(value => value === true);
            setIsUseCurrentUserOrgUnits(isAnyTrue);
        }

    }, [isSetPredifinedUserOrgUnits]);

    const handleShowSaveVisualTypeForm = () => {
        setIsShowSaveVisualTypeForm(true);
    };

    const handleExportVisualization = () => {
        setIsShowExportModal(true);
    };

    //// function to handle show modals
    const handleShowDataModal = () => setIsShowDataModal(true);
    const handleShowOrganizationUnitModal = () => setIsShowOrganizationUnit(true);
    const handleShowPeriodModal = () => setIsShowPeriod(true);

    // Function to render the selected chart
    const renderChart = () => {
        const SelectedChart = chartComponents.find(chart => chart.type === selectedChartType)?.component;
        return SelectedChart ? <SelectedChart data={analyticsData} visualTitleAndSubTitle={visualTitleAndSubTitle} visualSettings={visualSettings} /> : null;
    };

    /// handle data source onchange
    const handleDataSourceOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
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

            fetchExternalDataItems(newSelectedDetails.url, newSelectedDetails.token, selectedDimensionItemType);
            fetchExternalUserInfoAndOrgUnitData(newSelectedDetails.url, newSelectedDetails.token);

        }

        // Step 3: Update details and reset default values *afterwards*
        setSelectedDataSourceDetails(newSelectedDetails);
        resetOtherValuesToDefaultExceptDataSource();

    };

    /// fetch current user and Organization unit
    const fetchCurrentUserAndOrgUnitData = async () => {
        const result = await fetchCurrentUserInfoAndOrgUnitData();
        setCurrentUserInfoAndOrgUnitsData(result);
    };

    useEffect(() => {
        selectedDataSourceDetailsRef.current = selectedDataSourceDetails;
        // reset to pagination to page one if datasource is changed
        setDataItemsDataPage(1);
    }, [selectedDataSourceDetails]);

    /// main return
    return (
        <div className="min-h-screen bg-gray-50 p-1">

            {(isFetchSingleVisualLoading || loading) ? <Loading /> :
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
                                     {i18n.t('SETTINGS')}
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="DATA" className="pt-4">
                                <div>
                                    {/* Select Data Source Dropdown */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1"> {i18n.t('Data Source')}</label>
                                        <select value={selectedDataSourceOption} onChange={handleDataSourceOnChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                            <option value={currentInstanceId}  >{systemInfo?.title?.applicationTitle}</option>
                                            {dataSourceOptions}
                                        </select>
                                    </div>
                                    {/* data items */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{i18n.t('Main Dimensions')}</label>
                                        <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading) ? "Loading.." : `${i18n.t('Data')} ${analyticsDimensions?.dx?.length === 0 ? "" : `(${analyticsDimensions?.dx?.length})`}`} `} onClick={handleShowDataModal} />
                                    </div>
                                    {/* Period */}
                                    <div className="mb-4">
                                        {/* <label className="block text-sm font-medium text-gray-700 mb-1">Period</label> */}
                                        <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading) ? "Loading.." : `${i18n.t('Period')} ${analyticsDimensions?.pe?.length === 0 ? "" : `(${analyticsDimensions?.pe?.length})`} `} `} onClick={handleShowPeriodModal} />
                                    </div>
                                    {/* Organization Unit */}
                                    <div className="mb-4">
                                        {/* <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Unit</label> */}
                                        <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading) ? "Loading.." : `${i18n.t('Organization Unit')} `} `} onClick={handleShowOrganizationUnitModal} />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="SETTINGS" className="pt-4">
                                <VisualSettings setIsShowStyles={setIsShowStyles} />
                            </TabsContent>
                        </Tabs>

                        {/* Visualization Area */}
                        <div className="flex-grow bg-white shadow-md p-4 rounded-lg mx-4 bg-green-500 ">
                            <div className="flex mb-1 gap-1 ">

                                    <SelectChartType
                                        chartComponents={chartComponents}
                                        selectedChartType={selectedChartType}
                                        setSelectedChartType={setSelectedChartType}
                                    />
                                      <FileActionMenu 
    visualId={visualId} 
    handleExportVisualization={handleExportVisualization} 
    handleShowSaveVisualTypeForm={handleShowSaveVisualTypeForm} 
  />
                               

                            </div>
                            <FilteringVisualsDragAndDrop/>
                            <div className="h-[600px] flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100" ref={visualizationRef}>
                                
                                {isFetchAnalyticsDataLoading ? (
                                    <Loading />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-[600px]">
                                        <div className="w-[100%] max-h-[100%]">
                                            {fetchAnalyticsDataError ?
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
                        <DataModal data={dataItemsData} loading={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} error={dataItemsFetchError} setIsShowDataModal={setIsShowDataModal} subDataItemsData={subDataItemsData}  />
                    </GenericModal>
                    <GenericModal isOpen={isShowOrganizationUnit} setIsOpen={setIsShowOrganizationUnit}>
                        <OrganizationModal data={currentUserInfoAndOrgUnitsData} loading={orgUnitLoading} error={fetchOrgUnitError} setIsShowOrganizationUnit={setIsShowOrganizationUnit} />
                    </GenericModal>
                    <GenericModal isOpen={isShowPeriod} setIsOpen={setIsShowPeriod}>
                        <PeriodModal setIsShowPeriod={setIsShowPeriod} />
                    </GenericModal>
                    {/* save visual type form */}
                    <GenericModal isOpen={isShowSaveVisualTypeForm} setIsOpen={setIsShowSaveVisualTypeForm}>
                        <SaveVisualTypeForm visualId={visualId} singleSavedVisualData={singleSavedVisualData} setIsShowSaveVisualTypeForm={setIsShowSaveVisualTypeForm} selectedChartType={selectedChartType} selectedDataSourceId={selectedDataSourceOption} />
                    </GenericModal>
                    {/* general charts option */}
                    <GenericModal isOpen={isShowStyles} setIsOpen={setIsShowStyles}>
                        <GeneralChartsStyles setIsShowStyles={setIsShowStyles} titleOption={titleOption} setTitleOption={setTitleOption} subtitleOption={subtitleOption} setSubtitleOption={setSubtitleOption} />
                    </GenericModal>
                    {isShowExportModal && (
                        <ExportModal setIsShowExportModal={setIsShowExportModal} visualizationRef={visualizationRef} />
                    )}
                </>
            }

        </div>
    );
}

export default Visualizers;