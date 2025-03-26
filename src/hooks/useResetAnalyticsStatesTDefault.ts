import { useAuthorities } from "../context/AuthContext"
import { dimensionItemTypes } from '../constants/dimensionItemTypes';
import { useSystemInfo } from "../services/fetchSystemInfo";
import { chartComponents } from "../constants/systemCharts";
import { systemDefaultColorPalettes } from "../constants/colorPalettes";
import { currentInstanceId } from "../constants/currentInstanceInfo";

type resetAnalyticsStatesToDefaultValuesParams = {
    isBeingUsedInMap?:boolean
}


export const useResetAnalyticsStatesToDefault = ()=>{
  const {  setGeoFeaturesData,setAnalyticsMapData,setMetaMapData, selectedColorPalette,currentUserInfoAndOrgUnitsData, setSelectedDataSourceOption,setSelectedVisualSettings,setVisualsColorPalettes,setIsUseCurrentUserOrgUnits,setSelectedOrganizationUnits,setSelectedOrgUnits,setSelectedOrgUnitGroups,setSelectedOrganizationUnitsLevels,setSelectedLevel,setSelectedVisualTitleAndSubTitle,setIsSetPredifinedUserOrgUnits,setAnalyticsDimensions,setSelectedChartType,setSelectedDimensionItemType,setSelectedDataSourceDetails,setAnalyticsData,setAnalyticsQuery} =   useAuthorities()
  const { data: systemInfo } = useSystemInfo();
  const defaultUserOrgUnit = currentUserInfoAndOrgUnitsData?.currentUser?.organisationUnits?.[0]?.displayName;
 
      /// function to clear reset to default values
      function resetAnalyticsStatesToDefaultValues({isBeingUsedInMap}:resetAnalyticsStatesToDefaultValuesParams = {}) {
        setSelectedDimensionItemType(dimensionItemTypes[0]);
        setSelectedDataSourceDetails({
            instanceName: systemInfo?.title?.applicationTitle || "", // Fallback to an empty string if undefined
            isCurrentInstance: true,
        });
        setAnalyticsData(null);
        setSelectedChartType(chartComponents[0]?.type);
        setAnalyticsQuery(null);
        setAnalyticsDimensions({ dx: [], pe: ['LAST_12_MONTHS'] });
        setIsSetPredifinedUserOrgUnits({
            is_USER_ORGUNIT: true,
            is_USER_ORGUNIT_CHILDREN: false,
            is_USER_ORGUNIT_GRANDCHILDREN: false
        });
       
        setIsUseCurrentUserOrgUnits(true);
        setSelectedOrganizationUnits([]);
        setSelectedOrgUnits([]);
        setSelectedOrgUnitGroups([]);
        setSelectedOrganizationUnitsLevels([]);
        setSelectedLevel([]);
        setSelectedVisualTitleAndSubTitle((prev) => {
            return {
                ...prev,
                visualTitle: "",
                DefaultSubTitle: [defaultUserOrgUnit],
                customSubTitle: ""
            };
        });
        setVisualsColorPalettes(systemDefaultColorPalettes[0] || []);
        setSelectedVisualSettings({ backgroundColor: '#ffffff', visualColorPalette: selectedColorPalette, fillColor: "#ffffff", XAxisSettings: { color: "#000000", fontSize: 12 }, YAxisSettings: { color: "#000000", fontSize: 12 } });
        setSelectedDataSourceOption(currentInstanceId);
        if(isBeingUsedInMap)
        {
            setGeoFeaturesData([])
            setAnalyticsMapData([])
            setMetaMapData([])
        }
    }
    ///
    function resetOtherValuesToDefaultExceptDataSource() {
        setSelectedDimensionItemType(dimensionItemTypes[0]);
        setAnalyticsData(null);
        setSelectedChartType(chartComponents[0]?.type);
        setAnalyticsQuery(null);
        setAnalyticsDimensions({ dx: [], pe: ['LAST_12_MONTHS'] });
        setIsSetPredifinedUserOrgUnits({
            is_USER_ORGUNIT: true,
            is_USER_ORGUNIT_CHILDREN: false,
            is_USER_ORGUNIT_GRANDCHILDREN: false
        });
        setIsUseCurrentUserOrgUnits(true);
        setSelectedOrganizationUnits([]);
        setSelectedOrgUnits([]);
        setSelectedOrgUnitGroups([]);
        setSelectedOrganizationUnitsLevels([]);
        setSelectedLevel([]);
        setSelectedVisualTitleAndSubTitle((prev) => {
            return {
                ...prev,
                visualTitle: "",
                DefaultSubTitle: [defaultUserOrgUnit],
                customSubTitle: ""
            };
        });
        setVisualsColorPalettes(systemDefaultColorPalettes[0] || []);
        setSelectedVisualSettings({ backgroundColor: '#ffffff', visualColorPalette: selectedColorPalette, fillColor: "#ffffff", XAxisSettings: { color: "#000000", fontSize: 12 }, YAxisSettings: { color: "#000000", fontSize: 12 } });

    }



    return {resetAnalyticsStatesToDefaultValues,resetOtherValuesToDefaultExceptDataSource }
}