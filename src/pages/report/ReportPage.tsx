import { DataItemsModal } from '@/features/data-items'
import { useApplicationTitle } from '@/features/system'
;('use client')

import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import { useDataSources } from '@/features/data-sources'
import { GenericModal, Loading } from '../../components'
import { PeriodModal } from '@/features/periods'
import { OrganizationModal } from '../visualizers/Components/MetaDataModals'
import { dimensionDataHardCoded } from '../../constants/bulletinDimension'
import { useAuthorities } from '../../context/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { SaveVisualModal } from '@/features/visualizers'
import { useOrgUnitMetadata } from '@/features/org-units'
import { useNavigate, useParams } from 'react-router-dom'
import { useFetchSingleVisualData } from '../../services/fetchVisuals'
import { formatAnalyticsDimensions } from '@/features/analytics'
import { DEFAULT_CHART_TYPE } from '@/features/charts'
import GeneralChartsStyles from '../visualizers/Components/GeneralChartsOptions'
import { systemDefaultColorPalettes } from '../../constants/colorPalettes'
import { currentInstanceId } from '../../constants/currentInstanceInfo'
import debounce from 'lodash/debounce'
import { dimensionItemTypes } from '../../constants/dimensionItemTypes'
import ReportTemplate from './components/ReportTemplate'
import ReportBulletinLanding from './components/ReportBulletinLanding'

function ReportPage() {
    const { id: visualId } = useParams()
    const navigate = useNavigate()
    const applicationTitle = useApplicationTitle()
    const {
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
        setMetaDataLabels,
        setSelectedVisualSettings,
        selectedColorPalette,
        selectedDimensionItemType,
        analyticsPayloadDeterminer,
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
    const [isShowOrganizationUnit, setIsShowOrganizationUnit] = useState<boolean>(false)
    const [isShowPeriod, setIsShowPeriod] = useState<boolean>(false)
    const [isShowSaveVisualTypeForm, setIsShowSaveVisualTypeForm] = useState<boolean>(false)
    const [isShowStyles, setIsShowStyles] = useState<boolean>(false)
    const [titleOption, setTitleOption] = useState<'none' | 'custom'>('none')
    const [subtitleOption, setSubtitleOption] = useState<'auto' | 'none' | 'custom'>('auto')
    const [dataSubmitted, setDataSubmitted] = useState(false)
    const [isPeriodInBulletin, setisPeriodInBulletin] = useState(false)

    /// function to clear reset to default values
    function resetToDefaultValues() {
        setSelectedDimensionItemType(dimensionItemTypes[0])
        setSelectedDataSourceDetails({
            instanceName: applicationTitle, // Fallback to an empty string if undefined
            isCurrentInstance: true,
        })
        setAnalyticsData(null)
        setMetaDataLabels({})
        setSelectedChartType(DEFAULT_CHART_TYPE)
        setAnalyticsQuery(null)
        setAnalyticsDimensions({ dx: [], pe: ['LAST_12_MONTHS'] })
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
        setSelectedVisualSettings({
            backgroundColor: '#ffffff',
            visualColorPalette: selectedColorPalette,
            fillColor: '#ffffff',
            XAxisSettings: { color: '#000000', fontSize: 12 },
            YAxisSettings: { color: '#000000', fontSize: 12 },
        })
        setSelectedDataSourceOption(currentInstanceId)
    }

    // if visualId is false then set all chart related states to default
    useEffect(() => {
        if (!visualId) {
            resetToDefaultValues()
            /// if no visual created , fetch data of current instance
        }
    }, [visualId])

    //// run analytics API
    const debounceRunAnalytics = useCallback(
        debounce(() => {
            if (singleSavedVisualData && visualId) {
                setAnalyticsData([])
                setAnalyticsQuery(null)
                // Previously called with positional args, so it never ran (see Phase 4 notes).
                fetchAnalyticsData({
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
        }, 500),
        [analyticsDimensions, singleSavedVisualData, visualId]
    )

    useEffect(() => {
        debounceRunAnalytics()
        return debounceRunAnalytics.cancel // Cleanup debounce on unmount
    }, [debounceRunAnalytics])

    // update if current user organization is selected
    useEffect(() => {
        if (singleSavedVisualData) {
            const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(
                (value) => value === true
            )
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

    /// main return
    return (
        <div className="min-h-screen bg-gray-50 p-4">
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
                            </TabsList>
                            <TabsContent value="DATA" className="pt-4">
                                <div>
                                    {/* data items */}
                                    {/* Period */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Period
                                        </label>
                                        <Button
                                            variant="source"
                                            text={`${`Period ${analyticsDimensions?.pe?.length === 0 ? '' : `(${analyticsDimensions?.pe?.length})`} `} `}
                                            onClick={handleShowPeriodModal}
                                        />
                                    </div>
                                    {/* Organization Unit */}
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
                                            {dataSubmitted ? (
                                                <ReportTemplate />
                                            ) : (
                                                <ReportBulletinLanding />
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
                            onUpdate={() =>
                                fetchAnalyticsData({
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
                            bulletinMode
                            onClose={() => setIsShowPeriod(false)}
                            updating={isFetchAnalyticsDataLoading}
                            onUpdate={async () => {
                                // Bulletins always use the fixed bulletin data items (a new object:
                                // Redux state is immutable).
                                await fetchAnalyticsData({
                                    dimension: formatAnalyticsDimensions({
                                        ...analyticsDimensions,
                                        dx: dimensionDataHardCoded,
                                    }),
                                    instance: selectedDataSourceDetails,
                                    analyticsPayloadDeterminer,
                                    selectedOrganizationUnits,
                                    selectedOrgUnitGroups,
                                    selectedOrganizationUnitsLevels,
                                    isUseCurrentUserOrgUnits,
                                    isSetPredifinedUserOrgUnits,
                                })
                                setDataSubmitted(true)
                            }}
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
                </>
            )}
        </div>
    )
}

export default ReportPage
