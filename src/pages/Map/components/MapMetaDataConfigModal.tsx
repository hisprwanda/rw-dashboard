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


type MapMetaDataConfigModalProps = {
  themeLayerType: "Thematic Layer" | any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MapMetaDataConfigModal({ 
  themeLayerType, 
  isOpen, 
  onOpenChange 
}: MapMetaDataConfigModalProps) {
  const { loading: orgUnitLoading, error: fetchOrgUnitError, data: orgUnitsData, fetchCurrentUserInfoAndOrgUnitData } = useOrgUnitData();
  const { subDataItemsData, setDataItemsDataPage, dataItemsDataPage, selectedDataSourceOption, setSelectedDataSourceOption, currentUserInfoAndOrgUnitsData, setCurrentUserInfoAndOrgUnitsData, dataItemsData, selectedDataSourceDetails, setSelectedDataSourceDetails, setSelectedDimensionItemType, analyticsData, isFetchAnalyticsDataLoading, selectedChartType, setSelectedChartType, setAnalyticsQuery, isUseCurrentUserOrgUnits, analyticsQuery, analyticsDimensions, setAnalyticsDimensions, setIsSetPredifinedUserOrgUnits, isSetPredifinedUserOrgUnits, selectedOrganizationUnits, setSelectedOrganizationUnits, setIsUseCurrentUserOrgUnits, selectedOrgUnits, setSelectedOrgUnits, selectedOrgUnitGroups, setSelectedOrgUnitGroups, selectedOrganizationUnitsLevels, setSelectedOrganizationUnitsLevels, selectedLevel, setSelectedLevel, fetchAnalyticsData, setAnalyticsData, fetchAnalyticsDataError, setSelectedVisualTitleAndSubTitle, visualTitleAndSubTitle, visualSettings, setSelectedVisualSettings, setVisualsColorPalettes, selectedColorPalette, selectedDimensionItemType } = useAuthorities();
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error if indicator group has a value
    if (field === 'indicatorGroup' && value) {
      setHasError(false);
    } else if (field === 'indicatorGroup' && !value) {
      setHasError(true);
    }
  };

  const tabs = [
    { id: "data", label: "Data" },
    { id: "period", label: "Period" },
    { id: "orgUnits", label: "Org Units" },
    { id: "filter", label: "Filter" },
    { id: "style", label: "Style" }
  ];

  const handleAddLayer = async(e) => {
     // Stop event propagation
     e.stopPropagation();
     e.preventDefault();

    await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions), selectedDataSourceDetails);
   // onOpenChange(false);
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
          <div className="py-4">
            <p className="text-gray-500">Style configuration options will appear here.</p>
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
        
        <form onSubmit={handleSubmit}>
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
              type="submit" 
             // disabled={isLoading || hasError}
             // className={`mt-4 ${hasError ? 'opacity-50 cursor-not-allowed' : ''}`}
              className={`mt-4`}
              onClick={handleAddLayer}
            >
              {isLoading ? "Adding..." : "Add layer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}