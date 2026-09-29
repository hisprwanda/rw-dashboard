import { DataItemsModal } from '@/features/data-items'
import type { SelectedDataSource } from '@/features/analytics'
import { useApplicationTitle } from '@/features/system'
import React, { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { FileActionMenu } from './Components/FileActionMenu'
import { useDataSources } from '@/features/data-sources'
import { GenericModal, Loading } from '../../components'
import { PeriodModal } from '@/features/periods'
import { OrganizationModal } from './Components/MetaDataModals'
import { useAuthorities } from '../../context/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import SelectChartType from './Components/SelectChartType'
import { SaveVisualModal } from '@/features/visualizers'
import { useOrgUnitMetadata } from '@/features/org-units'
import { useNavigate, useParams } from 'react-router-dom'
import { useFetchSingleVisualData } from '../../services/fetchVisuals'
import { ChartRenderer, chartRegistry } from '@/features/charts'
import GeneralChartsStyles from './Components/GeneralChartsOptions'
import VisualSettings from './Components/VisualSettings'
import { currentInstanceId } from '../../constants/currentInstanceInfo'
import ExportModal from './Components/ExportModal'
import i18n from '@dhis2/d2-i18n'
import { useResetAnalyticsStatesToDefault } from '../../hooks/useResetAnalyticsStatesTDefault'
import FilteringVisualsDragAndDrop from './Components/FilteringVisuals/FilteringVisualsDragAndDrop'
import { GrUpdate } from 'react-icons/gr'
import { formatAnalyticsDimensions } from '@/features/analytics'
function Visualizers() {
    const { id: visualId } = useParams()
    const navigate = useNavigate()
    const applicationTitle = useApplicationTitle()
    const {
        fetchAnalyticsData,
        analyticsPayloadDeterminer,
        metaDataLabels,
        selectedDataSourceOption,
        setSelectedDataSourceOption,
        currentUserInfoAndOrgUnitsData,
        selectedDataSourceDetails,
        setSelectedDataSourceDetails,
        setSelectedDimensionItemType,
        analyticsData,
        isFetchAnalyticsDataLoading,
        selectedChartType,
        setSelectedChartType,
        setAnalyticsQuery,
        isUseCurrentUserOrgUnits,
        analyticsQuery,
        analyticsDimensions,
        setAnalyticsDimensions,
        setIsSetPredifinedUserOrgUnits,
        isSetPredifinedUserOrgUnits,
        selectedOrganizationUnits,
        selectedOrganizationUnitsLevels,
        selectedOrgUnitGroups,
        setSelectedOrganizationUnits,
        setIsUseCurrentUserOrgUnits,
        fetchAnalyticsDataError,
        visualTitleAndSubTitle,
        visualSettings,
        setSelectedVisualSettings,
        selectedColorPalette,
        selectedDimensionItemType,
    } = useAuthorities()
    const { isLoading: orgUnitLoading, error: fetchOrgUnitError } =
        useOrgUnitMetadata(selectedDataSourceDetails)
    const {
        data: singleSavedVisualData,
        isError,
        loading: isFetchSingleVisualLoading,
    } = useFetchSingleVisualData(visualId)
    const defaultUserOrgUnit =
        currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName
    const { data: savedDataSources, isLoading: loading } = useDataSources()
    const [isShowDataModal, setIsShowDataModal] = useState<boolean>(false)
    const [isShowExportModal, setIsShowExportModal] = useState<boolean>(false)
    const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState<boolean>(false)
    const [isShowPeriod, setIsShowPeriod] = useState<boolean>(false)
    const [isShowSaveVisualTypeForm, setIsShowSaveVisualTypeForm] = useState<boolean>(false)
    const [isShowStyles, setIsShowStyles] = useState<boolean>(false)
    const [titleOption, setTitleOption] = useState<'none' | 'custom'>('none')
    const [subtitleOption, setSubtitleOption] = useState<'auto' | 'none' | 'custom'>('auto')
    const visualizationRef = useRef<HTMLDivElement>(null)
    const captureRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const { resetOtherValuesToDefaultExceptDataSource, resetAnalyticsStatesToDefaultValues } =
        useResetAnalyticsStatesToDefault()

    //// data source options
    const dataSourceOptions = savedDataSources?.map((entry: any) => (
        <option key={entry?.key} value={entry?.key}>
            {entry?.value?.instanceName}
        </option>
    ))
    // if visualId is false then set all chart related states to default
    useEffect(() => {
        if (!visualId) {
            resetAnalyticsStatesToDefaultValues()
        }
    }, [visualId])

    const handleShowSaveVisualTypeForm = () => {
        setIsShowSaveVisualTypeForm(true)
    }

    const handleExportVisualization = () => {
        setIsShowExportModal(true)
    }

    //// function to handle show modals
    const handleShowDataModal = () => setIsShowDataModal(true)
    const handleShowOrganizationUnitModal = () => setIsShowOrganizationUnit(true)
    const handleShowPeriodModal = () => setIsShowPeriod(true)

    // Function to render the selected chart
    const renderChart = () => (
        <ChartRenderer
            type={selectedChartType}
            data={analyticsData}
            visualTitleAndSubTitle={visualTitleAndSubTitle}
            visualSettings={visualSettings}
            metaDataLabels={metaDataLabels}
            analyticsPayloadDeterminer={analyticsPayloadDeterminer}
        />
    )

    /// handle data source onchange
    const handleDataSourceOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value
        // Step 1: Update selected data source option
        setSelectedDataSourceOption(selectedValue)

        // Step 2: Resolve the connection of the picked source
        let newSelectedDetails: SelectedDataSource
        if (selectedValue === currentInstanceId) {
            newSelectedDetails = { instanceName: applicationTitle, isCurrentInstance: true }
        } else {
            const saved = savedDataSources?.find((item) => item.key === selectedValue)?.value
            if (!saved) return
            newSelectedDetails = saved
        }

        // Step 3: Update details and reset default values *afterwards*
        setSelectedDataSourceDetails(newSelectedDetails)
        resetOtherValuesToDefaultExceptDataSource()
    }

    // run analytics
    const handleRunAnalytics = async () => {
        await fetchAnalyticsData({
            dimension: formatAnalyticsDimensions(analyticsDimensions),
            instance: selectedDataSourceDetails,
            analyticsPayloadDeterminer,
            selectedOrganizationUnits,
            selectedOrgUnitGroups,
            selectedOrganizationUnitsLevels,
            isUseCurrentUserOrgUnits,
            isSetPredifinedUserOrgUnits,
        })
    }

    /// main return
    return (
        <div className="min-h-screen bg-gray-50 p-1">
            {isFetchSingleVisualLoading || loading ? (
                <Loading />
            ) : (
                <>
                    <div className="flex justify-between items-start">
                        <Tabs
                            defaultValue="DATA"
                            className="w-1/4 bg-white shadow-md rounded-lg p-4"
                        >
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {' '}
                                            {i18n.t('Data Source')}
                                        </label>
                                        <select
                                            value={selectedDataSourceOption}
                                            onChange={handleDataSourceOnChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value={currentInstanceId}>
                                                {applicationTitle}
                                            </option>
                                            {dataSourceOptions}
                                        </select>
                                    </div>
                                    {/* data items */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {i18n.t('Main Dimensions')}
                                        </label>
                                        <Button
                                            variant="source"
                                            text={`${`${i18n.t('Data')} ${analyticsDimensions?.dx?.length === 0 ? '' : `(${analyticsDimensions?.dx?.length})`}`} `}
                                            onClick={handleShowDataModal}
                                        />
                                    </div>
                                    {/* Period */}
                                    <div className="mb-4">
                                        <Button
                                            variant="source"
                                            text={`${`${i18n.t('Period')} ${analyticsDimensions?.pe?.length === 0 ? '' : `(${analyticsDimensions?.pe?.length})`} `} `}
                                            onClick={handleShowPeriodModal}
                                        />
                                    </div>
                                    {/* Organization Unit */}
                                    <div className="mb-4">
                                        <Button
                                            variant="source"
                                            text={`${`${i18n.t('Organization Unit')} `} `}
                                            onClick={handleShowOrganizationUnitModal}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="SETTINGS" className="pt-4">
                                <VisualSettings setIsShowStyles={setIsShowStyles} />
                            </TabsContent>
                        </Tabs>

                        {/* Visualization Area */}
                        <div className="flex-grow bg-white shadow-md  rounded-lg mx-4 bg-green-500 ">
                            <div className="flex mb-1 gap-1 ">
                                <button
                                    className="
    inline-flex        
    items-center      
    gap-2              
    border border-gray-300
    rounded-md
    bg-white hover:bg-gray-50
    text-blue-600       
    transition-colors     
    duration-150
    ease-in-out
    px-3 py-1 font-bold
  "
                                    onClick={handleRunAnalytics}
                                    disabled={isFetchAnalyticsDataLoading}
                                >
                                    <span>Update</span>
                                    <GrUpdate />
                                </button>
                                <SelectChartType
                                    chartComponents={chartRegistry}
                                    selectedChartType={selectedChartType}
                                    setSelectedChartType={setSelectedChartType}
                                />
                                <FileActionMenu
                                    visualId={visualId}
                                    handleExportVisualization={handleExportVisualization}
                                    handleShowSaveVisualTypeForm={handleShowSaveVisualTypeForm}
                                />
                            </div>
                            <FilteringVisualsDragAndDrop />
                            <div
                                className=" flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100"
                                ref={visualizationRef}
                            >
                                {isFetchAnalyticsDataLoading ? (
                                    <Loading />
                                ) : (
                                    <div className="flex items-center justify-center w-full  ">
                                        <div className="w-[100%] max-h-[100px]   ">
                                            {fetchAnalyticsDataError ? (
                                                <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg shadow-sm border border-red-300">
                                                    {fetchAnalyticsDataError?.message}
                                                </p>
                                            ) : (
                                                renderChart()
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Data, Organization Unit, and Period Modals */}
                    {isShowDataModal && (
                        <DataItemsModal
                            onClose={() => setIsShowDataModal(false)}
                            onUpdate={handleRunAnalytics}
                            updating={isFetchAnalyticsDataLoading}
                        />
                    )}
                    <GenericModal
                        isOpen={isShowOrganizationUnit}
                        setIsOpen={setIsShowOrganizationUnit}
                    >
                        <OrganizationModal
                            data={currentUserInfoAndOrgUnitsData}
                            loading={orgUnitLoading}
                            error={fetchOrgUnitError}
                            setIsShowOrganizationUnit={setIsShowOrganizationUnit}
                        />
                    </GenericModal>
                    {isShowPeriod && (
                        <PeriodModal
                            onClose={() => setIsShowPeriod(false)}
                            onUpdate={handleRunAnalytics}
                            updating={isFetchAnalyticsDataLoading}
                        />
                    )}
                    {/* save visual type form */}
                    {isShowSaveVisualTypeForm && (
                        <SaveVisualModal
                            visualId={visualId}
                            saved={singleSavedVisualData?.dataStore}
                            query={analyticsQuery}
                            onClose={() => setIsShowSaveVisualTypeForm(false)}
                            onSaved={(key) => {
                                setIsShowSaveVisualTypeForm(false)
                                // A new visual opens its saved URL (going through the list forces
                                // the builder to remount with the saved state).
                                if (!visualId) {
                                    navigate('/visualization')
                                    navigate(`/visualizers/${key}`)
                                }
                            }}
                        />
                    )}
                    {/* general charts option */}
                    <GenericModal isOpen={isShowStyles} setIsOpen={setIsShowStyles}>
                        <GeneralChartsStyles
                            setIsShowStyles={setIsShowStyles}
                            titleOption={titleOption}
                            setTitleOption={setTitleOption}
                            subtitleOption={subtitleOption}
                            setSubtitleOption={setSubtitleOption}
                        />
                    </GenericModal>
                    {isShowExportModal && (
                        <ExportModal
                            setIsShowExportModal={setIsShowExportModal}
                            visualizationRef={visualizationRef}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default Visualizers
