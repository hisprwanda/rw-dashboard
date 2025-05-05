import { useEffect, useState } from "react";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { DataModal, OrganizationModal, PeriodModal } from "../../../pages/visualizers/Components/MetaDataModals";
import { useAuthorities } from "../../../context/AuthContext";
import { useDataItems } from "../../../services/fetchDataItems";
import { useExternalDataItems } from "../../../services/useExternalDataItems";
import { useOrgUnitData } from "../../../services/fetchOrgunitData";
import { formatAnalyticsDimensions } from "../../../lib/formatAnalyticsDimensions";
import { useRunGeoFeatures } from "../../../services/maps";
import { getSelectedOrgUnitsWhenUsingMap } from "../../../lib/getAnalyticsFilters";
import ThematicStylesTab from "./themanticLayer/ThematicStylesTab";
import LegendControls from "./LegendControls";
import { legendControllersKitTypes } from "../../../types/mapFormTypes";


type MapMetaDataConfigModalProps = {
  themeLayerType: "Thematic Layer" | any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appliedLabels:string[];
   setAppliedLabels:any;
   selectedLabels:string[];
   setSelectedLabels:any;
   legendControllersKit:legendControllersKitTypes
}

export function MapMetaDataConfigModal({ 
  themeLayerType, 
  isOpen, 
  onOpenChange ,
  appliedLabels,
  setAppliedLabels,
  selectedLabels,
  setSelectedLabels,
  legendControllersKit
}: MapMetaDataConfigModalProps) {
  const {fetchGeoFeatures,loading:isFetchGeoDataLoading} = useRunGeoFeatures()
  const { loading: orgUnitLoading, error: fetchOrgUnitError, data: orgUnitsData, fetchCurrentUserInfoAndOrgUnitData } = useOrgUnitData();
  const { subDataItemsData, setDataItemsDataPage, dataItemsDataPage, selectedDataSourceOption, setSelectedDataSourceOption, currentUserInfoAndOrgUnitsData, setCurrentUserInfoAndOrgUnitsData, dataItemsData, selectedDataSourceDetails, setSelectedDataSourceDetails, setSelectedDimensionItemType, analyticsData, isFetchAnalyticsDataLoading, selectedChartType, setSelectedChartType, setAnalyticsQuery, isUseCurrentUserOrgUnits, analyticsQuery, analyticsDimensions, setAnalyticsDimensions, setIsSetPredifinedUserOrgUnits, isSetPredifinedUserOrgUnits, selectedOrganizationUnits, selectedOrgUnitGroups, selectedOrganizationUnitsLevels, fetchAnalyticsData } = useAuthorities();
  const { error: dataItemsFetchError, loading: isFetchCurrentInstanceDataItemsLoading, fetchCurrentInstanceData } = useDataItems();
  const { fetchExternalDataItems, response, error, loading: isFetchExternalInstanceDataItemsLoading } = useExternalDataItems();
  const [activeTab, setActiveTab] = useState("data");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemType: "Indicator",
    indicatorGroup: "",
    aggregationType: "By data element",
    showCompletedEvents: false
  });
  const orgUnitIds = selectedOrganizationUnits?.map((unit: any) => unit)?.join(';');
  const orgUnitLevelIds = selectedOrganizationUnitsLevels?.map((unit: any) => `LEVEL-${unit}`)?.join(';');
  const orgUnitGroupIds = selectedOrgUnitGroups?.map((item: any) => `OU_GROUP-${item}`)?.join(';');

  const selectedOrgUnitsWhenUsingMap =  getSelectedOrgUnitsWhenUsingMap({
   isUseCurrentUserOrgUnits,
   isSetPredifinedUserOrgUnits,
   orgUnitIds,
   orgUnitLevelIds,
   orgUnitGroupIds,
 })
 let selectedPeriodsOnMap = []
 selectedPeriodsOnMap.push(`pe:${analyticsDimensions?.pe?.join(";")}`);
  console.log("currentUserInfoAndOrgUnitsData",currentUserInfoAndOrgUnitsData)
  const [hasError, setHasError] = useState(true);

      /// fetch current user and Organization unit
      const fetchCurrentUserAndOrgUnitData = async () => {
        const result = await fetchCurrentUserInfoAndOrgUnitData();
        
        console.log("hello results",result)
        setCurrentUserInfoAndOrgUnitsData(result);
    };

    useEffect(()=>{
      fetchCurrentUserAndOrgUnitData()
    },[])

  const tabs = [
    { id: "data", label: "Data" },
    { id: "period", label: "Period" },
    { id: "orgUnits", label: "Org Units" },
    // { id: "filter", label: "Filter" },
    { id: "style", label: "Style" }
  ];

  const handleAddLayer = async(e) => {
     // Stop event propagation
     e.stopPropagation();
     e.preventDefault();
     const isAnalyticsApiUsedInMap = true
     const GeoFeaturesResult = await fetchGeoFeatures({selectedOrgUnitsWhenUsingMap})
     const analyticsResult = await fetchAnalyticsData({
      dimension: formatAnalyticsDimensions(analyticsDimensions,isAnalyticsApiUsedInMap),
      instance: selectedDataSourceDetails,
      isAnalyticsApiUsedInMap,selectedPeriodsOnMap,selectedOrgUnitsWhenUsingMap,
      selectedOrganizationUnits,
      selectedOrgUnitGroups,
      selectedOrganizationUnitsLevels,
      isUseCurrentUserOrgUnits,
      isSetPredifinedUserOrgUnits
    });
    onOpenChange(false);
  };

  // Different content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case "data":
        return (
          <div className="space-y-6 py-4">
              <DataModal data={dataItemsData} isDataModalBeingUsedInMap={true} loading={isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading} error={dataItemsFetchError}  subDataItemsData={subDataItemsData}  /> 
          </div>
        );
      case "period":
        return (
          <div className="py-4">
           <PeriodModal isDataModalBeingUsedInMap={true} />
          </div>
        );
      case "orgUnits":
        return (
          <div className="py-4">
          <OrganizationModal isDataModalBeingUsedInMap={true} data={currentUserInfoAndOrgUnitsData} loading={orgUnitLoading} error={fetchOrgUnitError}  />
             
            </div>
        );
      case "filter":
        return (
          <div className="py-4">
            <p className="text-gray-500">Filter configuration options will appear here.</p>
          </div>
        );
      case "style":
        return (
          <div className="py-6 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Labels Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-lg font-semibold  text-gray-800">Labels</h2>
              <ThematicStylesTab
                appliedLabels={appliedLabels}
                setAppliedLabels={setAppliedLabels}
                selectedLabels={selectedLabels}
                setSelectedLabels={setSelectedLabels}
              />
            </div>
        
            {/* Legends Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-lg font-semibold  text-gray-800">Legends</h2>
              <LegendControls
                legendType={legendControllersKit.legendType}
                selectedLegendSet={legendControllersKit.selectedLegendSet}
                setSelectedLegendSet={legendControllersKit.setSelectedLegendSet}
                sampleLegends={legendControllersKit.sampleLegends}
              />
            </div>
          </div>
        </div>
        
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-screen overflow-y-auto transition-all duration-300 ease-in-out bg-white"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Add new thematic layer</DialogTitle>
        </DialogHeader>
        
        <form >
          {/* Tab Navigation */}
          <div className="border-b flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-center ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                    : "text-gray-500"
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
              onClick={(e)=>handleAddLayer(e)} 
              disabled={(isFetchAnalyticsDataLoading || isFetchGeoDataLoading)}
             // className={`mt-4 ${hasError ? 'opacity-50 cursor-not-allowed' : ''}`}
              className={`mt-4`}
            >
              {(isFetchAnalyticsDataLoading|| isFetchGeoDataLoading)? "Adding layer..." : "Add layer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}