"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Button from "../../components/Button"
import { useDataSourceData } from "../../services/DataSourceHooks"
import { GenericModal, Loading } from "../../components"
import { DataModal, OrganizationModal, PeriodModal } from "../visualizers/Components/MetaDataModals"
import { useAuthorities } from "../../context/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import SaveVisualTypeForm from "../visualizers/Components/SaveVisualTypeForm"
import { useParams } from "react-router-dom"
import { useFetchSingleVisualData } from "../../services/fetchVisuals"
import { formatAnalyticsDimensions } from "../../lib/formatAnalyticsDimensions"
import { useOrgUnitData } from "../../services/fetchOrgunitData"
import { useDataItems } from "../../services/fetchDataItems"
import { chartComponents } from "../../constants/systemCharts"
import GeneralChartsStyles from "../visualizers/Components/GeneralChartsOptions"
import { systemDefaultColorPalettes } from "../../constants/colorPalettes"
import { useExternalDataItems } from "../../services/useExternalDataItems"
import { useSystemInfo } from "../../services/fetchSystemInfo"
import { useExternalOrgUnitData } from "../../services/fetchExternalOrgUnit"
import { currentInstanceId } from "../../constants/currentInstanceInfo"
import debounce from "lodash/debounce"
import { dimensionItemTypes } from "../../constants/dimensionItemTypes"
import ReportTemplate from "./components/ReportTemplate"
import ReportBulletinLanding from "./components/ReportBulletinLanding"

function ReportPage() {
  const { id: visualId } = useParams()
  const { data: systemInfo } = useSystemInfo()
  const {
    setDataItemsDataPage,
    selectedDataSourceOption,
    setSelectedDataSourceOption,
    currentUserInfoAndOrgUnitsData,
    setCurrentUserInfoAndOrgUnitsData,
    dataItemsData,
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
    setSelectedOrganizationUnits,
    setIsUseCurrentUserOrgUnits,
    selectedOrgUnits,
    setSelectedOrgUnits,
    selectedOrgUnitGroups,
    setSelectedOrgUnitGroups,
    selectedOrganizationUnitsLevels,
    setSelectedOrganizationUnitsLevels,
    selectedLevel,
    setSelectedLevel,
    fetchAnalyticsData,
    setAnalyticsData,
    fetchAnalyticsDataError,
    setSelectedVisualTitleAndSubTitle,
    visualTitleAndSubTitle,
    visualSettings,
    setSelectedVisualSettings,
    setVisualsColorPalettes,
    selectedColorPalette,
    selectedDimensionItemType,
  } = useAuthorities()
  const {
    data: singleSavedVisualData,
    isError,
    loading: isFetchSingleVisualLoading,
  } = useFetchSingleVisualData(visualId)
  const {
    loading: orgUnitLoading,
    error: fetchOrgUnitError,
    data: orgUnitsData,
    fetchCurrentUserInfoAndOrgUnitData,
  } = useOrgUnitData()
  const {
    error: dataItemsFetchError,
    loading: isFetchCurrentInstanceDataItemsLoading,
    fetchCurrentInstanceData,
  } = useDataItems()
  const {
    fetchExternalDataItems,
    response,
    error,
    loading: isFetchExternalInstanceDataItemsLoading,
  } = useExternalDataItems()
  const { fetchExternalUserInfoAndOrgUnitData } = useExternalOrgUnitData()
  const defaultUserOrgUnit = currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName
  const { data: savedDataSource, loading } = useDataSourceData()
  const [isShowDataModal, setIsShowDataModal] = useState<boolean>(false)
  const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState<boolean>(false)
  const [isShowPeriod, setIsShowPeriod] = useState<boolean>(false)
  const [isShowSaveVisualTypeForm, setIsShowSaveVisualTypeForm] = useState<boolean>(false)
  const [isShowStyles, setIsShowStyles] = useState<boolean>(false)
  const selectedDataSourceDetailsRef = useRef(selectedDataSourceDetails)
  const [titleOption, setTitleOption] = useState<"none" | "custom">("none")
  const [subtitleOption, setSubtitleOption] = useState<"auto" | "none" | "custom">("auto")
  const [dataSubmitted, setDataSubmitted] = useState(false)
  const [isPeriodInBulletin, setisPeriodInBulletin] = useState(false)

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
    setAnalyticsDimensions({ dx: [], pe: ["LAST_12_MONTHS"] })
    setIsSetPredifinedUserOrgUnits({
      is_USER_ORGUNIT: true,
      is_USER_ORGUNIT_CHILDREN: false,
      is_USER_ORGUNIT_GRANDCHILDREN: false,
    })
    setIsUseCurrentUserOrgUnits(true)
    setSelectedOrganizationUnits([])
    setSelectedOrgUnits([])
    setSelectedOrgUnitGroups([])
    setSelectedOrganizationUnitsLevels([])
    setSelectedLevel([])
    setSelectedVisualTitleAndSubTitle((prev) => {
      return {
        ...prev,
        visualTitle: "",
        DefaultSubTitle: [defaultUserOrgUnit],
        customSubTitle: "",
      }
    })
    setVisualsColorPalettes(systemDefaultColorPalettes[0] || [])
    setSelectedVisualSettings({
      backgroundColor: "#ffffff",
      visualColorPalette: selectedColorPalette,
      fillColor: "#ffffff",
      XAxisSettings: { color: "#000000", fontSize: 12 },
      YAxisSettings: { color: "#000000", fontSize: 12 },
    })
    setSelectedDataSourceOption(currentInstanceId)
  }

  // if visualId is false then set all chart related states to default
  useEffect(() => {
    if (!visualId) {
      resetToDefaultValues()
      /// if no visual created , fetch data of current instance
      fetchCurrentInstanceData(selectedDimensionItemType)
      fetchCurrentUserAndOrgUnitData()
    }
  }, [visualId])

  //// run analytics API
  const debounceRunAnalytics = useCallback(
    debounce(() => {
      if (singleSavedVisualData && visualId) {
        keepUpWithSelectedDataSource()
        setAnalyticsData([])
        fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions), selectedDataSourceDetails)
      }
    }, 500),
    [analyticsDimensions, singleSavedVisualData, visualId],
  )

  useEffect(() => {
    debounceRunAnalytics()
    return debounceRunAnalytics.cancel // Cleanup debounce on unmount
  }, [debounceRunAnalytics])

  // update if current user organization is selected
  useEffect(() => {
    if (singleSavedVisualData) {
      const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some((value) => value === true)
      setIsUseCurrentUserOrgUnits(isAnyTrue)
    }
  }, [isSetPredifinedUserOrgUnits])

  useEffect(() => {
    setisPeriodInBulletin(true)
  })
  //// function to handle show modals
  const handleShowDataModal = () => setIsShowDataModal(true)
  const handleShowOrganizationUnitModal = () => setIsShowOrganizationUnit(true)
  const handleShowPeriodModal = () => {
    setIsShowPeriod(true)
    // Don't reset dataSubmitted when reopening the period modal
    // setDataSubmitted(false);
  }

  /// fetch current user and Organization unit
  const fetchCurrentUserAndOrgUnitData = async () => {
    const result = await fetchCurrentUserInfoAndOrgUnitData()
    setCurrentUserInfoAndOrgUnitsData(result)
  }

  // keepUp with selected data source
  function keepUpWithSelectedDataSource() {
    const details = selectedDataSourceDetailsRef.current

    if (!details) return

    // Proceed with using the latest `details`
    if (details.isCurrentInstance) {
      fetchCurrentInstanceData(selectedDimensionItemType)
      fetchCurrentUserAndOrgUnitData()
    } else if (details.url && details.token) {
      fetchExternalDataItems(details.url, details.token, selectedDimensionItemType)
      fetchExternalUserInfoAndOrgUnitData(details.url, details.token)
    } else {
      console.error("Invalid data source details: Missing URL or token.")
    }
  }
  useEffect(() => {
    selectedDataSourceDetailsRef.current = selectedDataSourceDetails
    // reset to page one
    setDataItemsDataPage(1)
  }, [selectedDataSourceDetails])

  //// testing data items
  useEffect(() => {
    console.log("here is updated data items", dataItemsData)
  }, [dataItemsData])

  /// main return
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div>{/* <h3>Test Total: {dataItemsData?.pager?.total}</h3> */}</div>
      {isFetchSingleVisualLoading || loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-between items-start">
            <Tabs defaultValue="DATA" className="w-1/4 bg-white shadow-md rounded-lg p-4">
              <TabsList className="flex items-center justify-center ">
                <TabsTrigger value="DATA" className="text-lg font-semibold py-2 w-full text-left">
                  DIMENSIONS
                </TabsTrigger>
              </TabsList>
              <TabsContent value="DATA" className="pt-4">
                <div>
                  {/* data items */}
                  {/* <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Data</label>
                                <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source" text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading ) ? "Loading.." : `Data ${analyticsDimensions?.dx?.length === 0 ? "" : `(${analyticsDimensions?.dx?.length})`}`} `} onClick={handleShowDataModal} />
                            </div> */}
                  {/* Period */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <Button
                      disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading}
                      variant="source"
                      text={`${isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading ? "Loading.." : `Period ${analyticsDimensions?.pe?.length === 0 ? "" : `(${analyticsDimensions?.pe?.length})`} `} `}
                      onClick={handleShowPeriodModal}
                    />
                  </div>
                  {/* Organization Unit */}
                  {/* <div className="mb-4">
                                <Button disabled={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} variant="source"  text={`${(isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading ) ? "Loading.." : `Organisation Unit`} `} onClick={handleShowOrganizationUnitModal} />
                            </div> */}
                </div>
              </TabsContent>
            </Tabs>

            {/* Visualization Area */}
            <div className="flex-grow bg-white shadow-md p-4 rounded-lg mx-4">
              <div className="h-[600px] flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100">
                {isFetchAnalyticsDataLoading ? (
                  <Loading />
                ) : (
                  <div className="flex items-center justify-center w-full h-[600px]">
                    <div className="w-[100%] max-h-[100%] overflow-x-auto">
                      {dataSubmitted ? <ReportTemplate /> : <ReportBulletinLanding />}
                      {/* <ReportTemplate/>
                                    < ReportBulletinLanding/> */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Data, Organization Unit, and Period Modals */}
          <GenericModal isOpen={isShowDataModal} setIsOpen={setIsShowDataModal}>
            <DataModal
              data={dataItemsData}
              loading={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading}
              error={dataItemsFetchError}
              setIsShowDataModal={setIsShowDataModal}
            />
          </GenericModal>
          <GenericModal isOpen={isShowOrganizationUnit} setIsOpen={setIsShowOrganizationUnit}>
            <OrganizationModal
              data={currentUserInfoAndOrgUnitsData}
              loading={orgUnitLoading}
              error={fetchOrgUnitError}
              setIsShowOrganizationUnit={setIsShowOrganizationUnit}
            />
          </GenericModal>
          <GenericModal isOpen={isShowPeriod} setIsOpen={setIsShowPeriod}>
            <PeriodModal
              setIsShowPeriod={setIsShowPeriod}
              isAnalyticsDataHardCoded={true}
              setDataSubmitted={setDataSubmitted}
              isPeriodInBulletin={true}
            />
          </GenericModal>
          {/* save visual type form */}
          <GenericModal isOpen={isShowSaveVisualTypeForm} setIsOpen={setIsShowSaveVisualTypeForm}>
            <SaveVisualTypeForm
              visualId={visualId}
              singleSavedVisualData={singleSavedVisualData}
              setIsShowSaveVisualTypeForm={setIsShowSaveVisualTypeForm}
              selectedChartType={selectedChartType}
              selectedDataSourceId={selectedDataSourceOption}
            />
          </GenericModal>
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
        </>
      )}
    </div>
  )
}

export default ReportPage;