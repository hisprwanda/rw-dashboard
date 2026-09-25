import { useApplicationTitle } from '@/features/system'
import { useAuthorities } from '../context/AuthContext'
import { dimensionItemTypes } from '../constants/dimensionItemTypes'
import { DEFAULT_CHART_TYPE } from '@/features/charts'
import { systemDefaultColorPalettes } from '../constants/colorPalettes'
import { currentInstanceId } from '../constants/currentInstanceInfo'

type resetAnalyticsStatesToDefaultValuesParams = {
    isBeingUsedInMap?: boolean
}

export const useResetAnalyticsStatesToDefault = () => {
    const {
        setAnalyticsPayloadDeterminer,
        setCurrentBasemap,
        setGeoFeaturesData,
        setAnalyticsMapData,
        setMetaMapData,
        selectedColorPalette,
        currentUserInfoAndOrgUnitsData,
        setSelectedDataSourceOption,
        setSelectedVisualSettings,
        setVisualsColorPalettes,
        setIsUseCurrentUserOrgUnits,
        setSelectedOrganizationUnits,
        setSelectedOrgUnits,
        setSelectedOrgUnitGroups,
        setSelectedOrganizationUnitsLevels,
        setSelectedLevel,
        setIsSetPredifinedUserOrgUnits,
        setAnalyticsDimensions,
        setSelectedChartType,
        setSelectedDimensionItemType,
        setSelectedDataSourceDetails,
        setAnalyticsData,
        setMetaDataLabels,
        setAnalyticsQuery,
    } = useAuthorities()
    const applicationTitle = useApplicationTitle()
    const defaultUserOrgUnit =
        currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName

    /// function to clear reset to default values
    function resetAnalyticsStatesToDefaultValues({
        isBeingUsedInMap,
    }: resetAnalyticsStatesToDefaultValuesParams = {}) {
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
        setAnalyticsPayloadDeterminer({
            Columns: ['Data'],
            Rows: ['Period'],
            Filter: ['Organisation unit'],
        })
        setIsUseCurrentUserOrgUnits(true)
        setSelectedOrganizationUnits([])
        setSelectedOrgUnits([])
        setSelectedOrgUnitGroups([])
        setSelectedOrganizationUnitsLevels([])
        setSelectedLevel([])
        setVisualsColorPalettes(systemDefaultColorPalettes[0] || [])
        setSelectedVisualSettings({
            backgroundColor: '#ffffff',
            visualColorPalette: selectedColorPalette,
            fillColor: '#000000',
            XAxisSettings: { color: '#000000', fontSize: 12 },
            YAxisSettings: { color: '#000000', fontSize: 12 },
        })
        setSelectedDataSourceOption(currentInstanceId)
        if (isBeingUsedInMap) {
            setGeoFeaturesData([])
            setAnalyticsMapData([])
            setMetaMapData([])
            setCurrentBasemap('osm-light')
        }
    }
    ///
    function resetOtherValuesToDefaultExceptDataSource() {
        setSelectedDimensionItemType(dimensionItemTypes[0])
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
        setAnalyticsPayloadDeterminer({
            Columns: ['Data'],
            Rows: ['Period'],
            Filter: ['Organisation unit'],
        })
        setIsUseCurrentUserOrgUnits(true)
        setSelectedOrganizationUnits([])
        setSelectedOrgUnits([])
        setSelectedOrgUnitGroups([])
        setSelectedOrganizationUnitsLevels([])
        setSelectedLevel([])
        setVisualsColorPalettes(systemDefaultColorPalettes[0] || [])
        setSelectedVisualSettings({
            backgroundColor: '#ffffff',
            visualColorPalette: selectedColorPalette,
            fillColor: '#000000',
            XAxisSettings: { color: '#000000', fontSize: 12 },
            YAxisSettings: { color: '#000000', fontSize: 12 },
        })
    }

    return { resetAnalyticsStatesToDefaultValues, resetOtherValuesToDefaultExceptDataSource }
}
