import { PeriodPicker } from '@/features/periods'
import { DataItemsPicker } from '@/features/data-items'
import { useOrgUnitMetadata } from '@/features/org-units'
import { useEffect, useState } from 'react'

import { Button } from '../../../components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Checkbox } from '../../../components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select'
import { OrganizationModal } from '../../visualizers/Components/MetaDataModals'
import { useAuthorities } from '../../../context/AuthContext'
import { formatAnalyticsDimensions } from '@/features/analytics'
import { useRunGeoFeatures } from '../../../services/maps'
import { buildOrgUnitDimension } from '@/features/analytics'
import ThematicStylesTab from './themanticLayer/ThematicStylesTab'
import LegendControls from './LegendControls'

type MapMetaDataConfigModalProps = {
    themeLayerType: 'Thematic Layer' | any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedLabels: string[]
    setSelectedLabels: any
}

export function MapMetaDataConfigModal({
    themeLayerType,
    isOpen,
    onOpenChange,
    selectedLabels,
    setSelectedLabels,
}: MapMetaDataConfigModalProps) {
    const { fetchGeoFeatures, loading: isFetchGeoDataLoading } = useRunGeoFeatures()
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
        selectedOrgUnitGroups,
        selectedOrganizationUnitsLevels,
        fetchAnalyticsData,
    } = useAuthorities()
    const { isLoading: orgUnitLoading, error: fetchOrgUnitError } =
        useOrgUnitMetadata(selectedDataSourceDetails)
    const [activeTab, setActiveTab] = useState('data')
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        itemType: 'Indicator',
        indicatorGroup: '',
        aggregationType: 'By data element',
        showCompletedEvents: false,
    })
    const selectedOrgUnitsWhenUsingMap = buildOrgUnitDimension({
        useCurrentUserOrgUnits: isUseCurrentUserOrgUnits,
        userOrgUnitScope: isSetPredifinedUserOrgUnits,
        orgUnitIds: selectedOrganizationUnits,
        levelIds: selectedOrganizationUnitsLevels,
        groupIds: selectedOrgUnitGroups,
    })
    let selectedPeriodsOnMap = []
    selectedPeriodsOnMap.push(`pe:${analyticsDimensions?.pe?.join(';')}`)
    const [hasError, setHasError] = useState(true)

    const tabs = [
        { id: 'data', label: 'Data' },
        { id: 'period', label: 'Period' },
        { id: 'orgUnits', label: 'Org Units' },
        { id: 'style', label: 'Style' },
    ]

    const handleAddLayer = async (e) => {
        // Stop event propagation
        e.stopPropagation()
        e.preventDefault()
        const isAnalyticsApiUsedInMap = true
        const GeoFeaturesResult = await fetchGeoFeatures({ selectedOrgUnitsWhenUsingMap })
        const analyticsResult = await fetchAnalyticsData({
            dimension: formatAnalyticsDimensions(analyticsDimensions, isAnalyticsApiUsedInMap),
            instance: selectedDataSourceDetails,
            isAnalyticsApiUsedInMap,
            selectedPeriodsOnMap,
            selectedOrgUnitsWhenUsingMap,
            selectedOrganizationUnits,
            selectedOrgUnitGroups,
            selectedOrganizationUnitsLevels,
            isUseCurrentUserOrgUnits,
            isSetPredifinedUserOrgUnits,
        })
        onOpenChange(false)
    }

    // Different content based on active tab
    const getTabContent = () => {
        switch (activeTab) {
            case 'data':
                return (
                    <div className="space-y-6 py-4">
                        <DataItemsPicker />
                    </div>
                )
            case 'period':
                return (
                    <div className="py-4">
                        <PeriodPicker />
                    </div>
                )
            case 'orgUnits':
                return (
                    <div className="py-4">
                        <OrganizationModal
                            isDataModalBeingUsedInMap={true}
                            data={currentUserInfoAndOrgUnitsData}
                            loading={orgUnitLoading}
                            error={fetchOrgUnitError}
                        />
                    </div>
                )
            case 'filter':
                return (
                    <div className="py-4">
                        <p className="text-gray-500">
                            Filter configuration options will appear here.
                        </p>
                    </div>
                )
            case 'style':
                return (
                    <div className="py-6 px-4 md:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Labels Section */}
                            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                                <h2 className="text-lg font-semibold  text-gray-800">Labels</h2>
                                <ThematicStylesTab
                                    selectedLabels={selectedLabels}
                                    setSelectedLabels={setSelectedLabels}
                                />
                            </div>

                            {/* Legends Section */}
                            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                                <h2 className="text-lg font-semibold  text-gray-800">Legends</h2>
                                <LegendControls />
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto transition-all duration-300 ease-in-out bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Add new thematic layer</DialogTitle>
                </DialogHeader>

                <form>
                    {/* Tab Navigation */}
                    <div className="border-b flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 text-center ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium'
                                        : 'text-gray-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {getTabContent()}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="mt-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={(e) => handleAddLayer(e)}
                            disabled={isFetchAnalyticsDataLoading || isFetchGeoDataLoading}
                            className={`mt-4`}
                        >
                            {isFetchAnalyticsDataLoading || isFetchGeoDataLoading
                                ? 'Adding layer...'
                                : 'Add layer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
