import React, { useState, useEffect, useRef, useCallback } from "react";
import Button from "../../../../components/Button";
import { IoSaveOutline } from "react-icons/io5";
import { useDataItems } from "../../../../services/fetchDataItems";
import { useAuthorities } from "../../../../context/AuthContext";
import { formatAnalyticsDimensions } from "../../../../lib/formatAnalyticsDimensions";
import { dimensionItemTypes } from "../../../../constants/dimensionItemTypes";
import { useExternalDataItems } from "../../../../services/useExternalDataItems";
import { debounce } from "lodash";
import { CiCircleRemove } from "react-icons/ci";
import { CircularLoader } from '@dhis2/ui';

// Types
type TransferOption = {
  label: string;
  value: string;
};



interface DataModalProps {
  setIsShowDataModal?: (isShow: boolean) => void;
  data: any;
  loading: boolean;
  error: any;
  subDataItemsData:any;
  isDataModalBeingUsedInMap?:boolean
}

// Custom Transfer Component
const CustomTransfer: React.FC<{
  options: TransferOption[];
  availableSubOptions?:TransferOption[]
  selected: string[];
  onChange: (params: { selected: string[] }) => void;
  loading?: boolean;
  onEndReached?: () => void;
  className?: string;
}> = ({
  options,
  availableSubOptions,
  selected,
  onChange,
  loading = false,
  onEndReached,
  className = ''
}) => {

    const {
    backedSelectedItems,setBackedSelectedItems
  } = useAuthorities();


  
  useEffect(() => {
    const updatedBackedItems = selected.map(id => {
      const option = options.find(opt => opt.value === id);
      if (option) {
        return { id, label: option.label };
      }
      const existingItem = backedSelectedItems.find(item => item.id === id);
      if (existingItem) {
        return existingItem;
      }
      return { id, label: id };
    });
    
    setBackedSelectedItems(updatedBackedItems);
  }, [selected, options]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && onEndReached) {
      onEndReached();
    }
  };

  const handleSelect = (option: TransferOption) => {
    const newSelected = [...selected, option.value];
    onChange({ selected: newSelected });
  };

  const handleDeselect = (id: string) => {
    const newSelected = selected.filter(item => item !== id);
    onChange({ selected: newSelected });
  };

  // Handle select all
  const handleSelectAll = () => {
    // Get all available option values that aren't already selected
    const availableValues = options
      .filter(option => !selected.includes(option.value))
      .map(option => option.value);
    
    // Add them to selected items
    const newSelected = [...selected, ...availableValues];
    onChange({ selected: newSelected });
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    onChange({ selected: [] });
  };

  // test 
  useEffect(()=>{
    console.log("backedSelectedItems",backedSelectedItems)
  },[backedSelectedItems])

  return (
    <div className={`flex gap-4 h-96 ${className}`}>
      <div className="w-1/2 border rounded-lg overflow-hidden flex flex-col">
        <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Available Items</h3>
          <button
            onClick={handleSelectAll}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition duration-200"
            disabled={loading || options.length === 0}
          >
            Select All
          </button>
        </div>
        <div 
          className="flex-1 overflow-y-auto p-2"
          onScroll={handleScroll}
        >
         {loading && options.length === 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center text-gray-500">
                Searching...
              </div>
            </div>
          )}
          {options.map(option => (
            <div
              key={option.value}
              className={`p-2 hover:bg-gray-50 cursor-pointer rounded ${
                selected.includes(option.value) ? 'opacity-50' : ''
              }`}
              onClick={() => !selected.includes(option.value) && handleSelect(option)}
            >
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
          {loading && options.length > 0 && (
            <div className="p-2 text-center text-gray-500">
              Loading more...
            </div>
          )}
        </div>
      </div>

      <div className="w-1/2 border rounded-lg overflow-hidden flex flex-col">
        <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Selected Items</h3>
          <button
            onClick={handleDeselectAll}
            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-200"
            disabled={backedSelectedItems.length === 0}
          >
            Deselect All
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {backedSelectedItems.map(item => (
            <div
              key={item.id}
              className="p-2 hover:bg-gray-50 flex items-center justify-between rounded"
            >
              <span className="text-sm">{item.label}</span>
              <CiCircleRemove
  onClick={() => handleDeselect(item.id)}
  className=" cursor-pointer h-[30px] text-red-500 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition duration-200 ease-in-out text-xl"
/>

             
            </div>
          ))}
          {backedSelectedItems.length === 0 && (
            <div className="p-2 text-center text-gray-500">
              No items selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main DataModal Component
const DataModal: React.FC<DataModalProps> = ({
  setIsShowDataModal,
  data,
  error,
  loading,
  subDataItemsData,
  isDataModalBeingUsedInMap
}) => {
  const [searchDataItem, setSearchDataItem] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [groupsIdOrSubDataItemIds, setGroupsIdOrSubDataItemIds] = useState<string>("");
  const [otherOptionsId, setOtherOptionsId] = useState<string>("");
  const [debouncedGroupId, setDebouncedGroupId] = useState<string>("");
  const [debouncedOtherOptionsId, setDebouncedOtherOptionsId] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGroupChanging, setIsGroupChanging] = useState(false);
  const [isOtherOptionsChanging, setIsOtherOptionsChanging] = useState(false);

  const {
    error: dataItemsFetchError,
    loading: isFetchCurrentInstanceDataItemsLoading,
    fetchCurrentInstanceData,
  } = useDataItems();

  const {
    fetchExternalDataItems,
    error: errorFetchingExternalDataItems,
    loading: isFetchExternalInstanceDataItemsLoading,
  } = useExternalDataItems();

  const {
    selectedDimensionItemType,
    setSelectedDimensionItemType,
    dataItemsDataPage,
    setDataItemsDataPage,
    analyticsDimensions,
    setAnalyticsDimensions,
    fetchAnalyticsData,
    analyticsPayloadDeterminer,
    isFetchAnalyticsDataLoading,
    selectedDataSourceDetails,
    backedSelectedItems,setBackedSelectedItems,
    selectedOrganizationUnits,
    selectedOrgUnitGroups,
    selectedOrganizationUnitsLevels,
    isUseCurrentUserOrgUnits,
    isSetPredifinedUserOrgUnits
  } = useAuthorities();

  const [availableOptions, setAvailableOptions] = useState<TransferOption[]>([]);
  const [availableSubOptions, setAvailableSubOptions] = useState<TransferOption[]>([]);
  const [otherOptions, setOtherOptions] = useState<TransferOption[]>([]);
  const transferRef = useRef<HTMLDivElement>(null);

  const debouncedSearchHandler = useCallback(
    debounce((value: string) => {
      setIsSearching(true); 
      setDebouncedSearch(value);
      setDataItemsDataPage(1);
    }, 300),
    []
  );
  const debouncedGroupHandler = useCallback(
    debounce((value: string) => {
      setIsGroupChanging(true);
      setDebouncedGroupId(value);
      setDataItemsDataPage(1);
    }, 300),
    []
  );

  const debouncedOtherOptionsHandler = useCallback(
    debounce((value: string) => {
      setIsOtherOptionsChanging(true);
      setDebouncedOtherOptionsId(value);
      setDataItemsDataPage(1);
    }, 300),
    []
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDataItem(e.target.value);
    debouncedSearchHandler(e.target.value);
  };
  const handleDimensionGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setGroupsIdOrSubDataItemIds(newValue);
    debouncedGroupHandler(newValue);
  };

  const handleOtherOptionsIdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setOtherOptionsId(newValue);
    debouncedOtherOptionsHandler(newValue);
  };

  useEffect(() => {
    let transformedOptions: TransferOption[] = [];
    let transformedSubOptions: TransferOption[] = [];
    
    // Memoized options to avoid unnecessary recomputation
    const filterTransformedOptions = (options: TransferOption[], otherOptionsId, groupsIdOrSubDataItemIds) => {
      // If 'otherOptionsId' is REPORTING_RATE, filter based on that metric
            
      console.log("options 11",options)
      console.log("otherOptionsId selected",otherOptionsId)
      console.log("groupsIdOrSubDataItemIds",groupsIdOrSubDataItemIds)
      if (otherOptionsId === "REPORTING_RATE") {
        return options.filter(option => option.value?.split(".")?.[1] === "REPORTING_RATE");
      }else if (otherOptionsId === "REPORTING_RATE_ON_TIME") {
        return options.filter(option => option.value.includes("REPORTING_RATE_ON_TIME"));
      }
      else if (otherOptionsId === "ACTUAL_REPORTS") {
        return options.filter(option => option.value.includes("ACTUAL_REPORTS"));
      }
      else if (otherOptionsId === "EXPECTED_REPORTS") {
        return options.filter(option => option.value.includes("EXPECTED_REPORTS"));
      }
      
      // If 'groupsIdOrSubDataItemIds' is provided, filter based on the group
      // if (groupsIdOrSubDataItemIds) {
      //   return options.filter(option => option.value.includes(groupsIdOrSubDataItemIds));
      // }
  
      return options;
    };
  
    if (["dataItems", "Event Data Item", "Program Indicator", "Calculation"].includes(selectedDimensionItemType.value)) {
      transformedOptions = data?.dataItems?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })) || [];
  
      if (selectedDimensionItemType.value === "Event Data Item" || selectedDimensionItemType.value === "Program Indicator") {
        transformedSubOptions = subDataItemsData?.programs?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];
        setOtherOptions([]);
      }
    } else if (selectedDimensionItemType.value === "indicators") {
      transformedOptions = data?.indicators?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })) || [];
      transformedSubOptions = subDataItemsData?.indicatorGroups?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })) || [];
      setOtherOptions([]);
    } else if (selectedDimensionItemType.value === "dataElements") {
      if (otherOptionsId === "dataElementOperands") {
        transformedOptions = data?.dataElementOperands?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];
      } else {
        transformedOptions = data?.dataElements?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];
      }
  
      transformedSubOptions = subDataItemsData?.dataElementGroups?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })) || [];
      setOtherOptions([
        { label: "Totals Only", value: "" },
        { label: "Details Only", value: "dataElementOperands" },
      ]);
    } else if (selectedDimensionItemType.value === "dataSets") {
      const allMetrics = [
        { label: "All Metrics", value: "All Metrics" },
        { label: "Reporting Rate", value: "REPORTING_RATE" },
        { label: "Reporting Rate on Time", value: "REPORTING_RATE_ON_TIME" },
        { label: "Actual Reports", value: "ACTUAL_REPORTS" },
        { label: "Expected Reports", value: "EXPECTED_REPORTS" },
      ];
      let regularDataSet = data?.dataSets?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })) || [];
  
      transformedOptions = regularDataSet.flatMap(option =>
        allMetrics
          .filter(metric => metric.value !== "All Metrics") // Exclude "All Metrics"
          .map(metric => ({
            label: `${option.label} - ${metric.label}`,
            value: `${option.value}.${metric.value}`,
          }))
      );
      transformedSubOptions = data?.dataSets?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })) || [];
      setOtherOptions(allMetrics);
    }
  
    // Filter transformedOptions based on the selected filters
    const filteredTransformedOptions = filterTransformedOptions(transformedOptions, otherOptionsId, groupsIdOrSubDataItemIds);
    // Set the available options without making additional API requests
    setAvailableOptions(prev => dataItemsDataPage > 1 ? [...filteredTransformedOptions] : filteredTransformedOptions);
    setAvailableSubOptions(prev => dataItemsDataPage > 1 ? [...prev, ...transformedSubOptions] : transformedSubOptions);
  
  }, [data, subDataItemsData, selectedDimensionItemType, dataItemsDataPage, otherOptionsId, groupsIdOrSubDataItemIds]);
  


  useEffect(()=>{
    console.log("subDataItemsData",{subDataItemsData})
    console.log(" all data",{data})
  },[availableSubOptions,data])

  const handleDimensionItemTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    /// clear existing filtering ids before changing dimensionType
    setGroupsIdOrSubDataItemIds("")
    setDebouncedGroupId("")
    setOtherOptionsId("")
    setDebouncedOtherOptionsId("")
    setOtherOptions([])
    
    const selectedType = dimensionItemTypes.find((type) => type.value === event.target.value);
    if (selectedType) {
      setSelectedDimensionItemType(selectedType);
      setDataItemsDataPage(1);
      
    }
  };

  const handleChange = (newSelected: string[]) => {
    setAnalyticsDimensions((prev: any) => ({
      ...prev,
      dx: [...newSelected],
    }));
  };
  
  const handleUpdate = async () => {
    await fetchAnalyticsData({dimension:formatAnalyticsDimensions(analyticsDimensions),instance:selectedDataSourceDetails,analyticsPayloadDeterminer,
      selectedOrganizationUnits,
      selectedOrgUnitGroups,
      selectedOrganizationUnitsLevels,
      isUseCurrentUserOrgUnits,
      isSetPredifinedUserOrgUnits
    });
    setIsShowDataModal(false);
    setDataItemsDataPage(1);
  };

  const handleEndReached = useCallback(
    debounce(() => {
      if (!loading) {
        setDataItemsDataPage((prev: number) => prev + 1);
      }
    }, 300),
    [loading]
  );

useEffect(() => {
    if (selectedDataSourceDetails.isCurrentInstance) {
      fetchCurrentInstanceData(
        selectedDimensionItemType, 
        debouncedSearch, 
        dataItemsDataPage,
        debouncedGroupId,
        debouncedOtherOptionsId
      ).finally(() => {
        setIsSearching(false);
        setIsGroupChanging(false);
        setIsOtherOptionsChanging(false);
      });
    } else {
      fetchExternalDataItems(
        selectedDataSourceDetails.url,
        selectedDataSourceDetails.token,
        selectedDimensionItemType,
        debouncedSearch,
        dataItemsDataPage,
        debouncedGroupId,
        debouncedOtherOptionsId
      ).finally(() => {
        setIsSearching(false);
        setIsGroupChanging(false);
        setIsOtherOptionsChanging(false);
      });
    }
  }, [
    selectedDimensionItemType, 
    debouncedSearch, 
    dataItemsDataPage,
    debouncedGroupId,
    debouncedOtherOptionsId
  ]);

  const isLoadingGroups = loading || isGroupChanging || isOtherOptionsChanging;

   const [defaultGroupOrOtherData, setDefaultGroupOrOtherData] = useState<any>("")
       //// determining DefaultGroupOrOtherData title
       useEffect(() => {
        console.log("selectedDimensionItemType", selectedDimensionItemType);
      
        const { value } = selectedDimensionItemType || {};
      
        const groupMapping = {
          indicators: "All groups",
          dataElements: "All groups",
          dataSets: "All Data Sets",
          "Event Data Item": "All Programs",
          "Program Indicator": "All Programs",
        };
      
        setDefaultGroupOrOtherData(groupMapping[value]);
      }, [selectedDimensionItemType]);
      

        function determineGroupsTitle(value:string) {
          let label = "";
          switch (value) {
            case "dataElements":
              label = "Data Element Group";
              break;
            case "dataSets":
              label = "Data Set";
              break;
            case "Event Data Item":
              label = "Program";
              break;
            case "Program Indicator":
              label = "Program";
              break;
            default:
              label = `${value} Group`;
              break;
          }
          return label;
        }

  if (error) return <div>Error loading data...</div>;

  return (
    <div>
      {/* Search */}
        <div className="space-y-2 mb-3">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchDataItem}
          onChange={handleSearchChange}
          placeholder="Search data items..."
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
        />
      </div>
      {/* data types */}
      <div className="space-y-2 mb-3">
        <label htmlFor="dimensionItemType" className="block text-sm font-medium text-gray-700">
          DataType
        </label>
        <select
          id="dimensionItemType"
          value={selectedDimensionItemType?.value || ""}
          onChange={handleDimensionItemTypeChange}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
        >
          {dimensionItemTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
  
      </div>
      {/* Data items group  section*/}
      {
        [
          "indicators",
          "dataElements",
         "dataSets",
          "Event Data Item",
          "Program Indicator"
        ].includes(selectedDimensionItemType.value)  &&  <div className="flex gap-2"  >
           {/* Data items group */}
          <div className="space-y-2 mb-3">
        <label htmlFor="dimensionGroupId" className="block text-sm font-medium text-gray-700">
        {determineGroupsTitle(selectedDimensionItemType.value)}
       </label>
       <select
              id="dimensionGroupId"
              value={groupsIdOrSubDataItemIds}
              onChange={handleDimensionGroupChange}
              className={`w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm ${
                isLoadingGroups ? 'opacity-50' : ''
              }`}
              disabled={isLoadingGroups}
            >
          
              <option value="">{defaultGroupOrOtherData}</option>
              {availableSubOptions.map((type) => (
                <option key={type.value} value={type.value}>

                  {type.label}
                </option>
              ))}
            </select>
  
      </div>
           {/* OTHER OPTIONS */}
           {  [
          "dataElements",
          "dataSets"
        ].includes(selectedDimensionItemType.value)  &&     <div className="space-y-2 mb-3">
        <label htmlFor="otherOptionsId" className="block text-sm font-medium text-gray-700">
          {selectedDimensionItemType.value === "dataElements" ? "Disaggregation" : "Metrics Type"}   
       </label>
          <select
                id="otherOptionsId"
                value={otherOptionsId}
                onChange={handleOtherOptionsIdChange}
                className={`w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm ${
                  isLoadingGroups ? 'opacity-50' : ''
                }`}
                disabled={isLoadingGroups}
              >
          {otherOptions.map((type) => {
            // main
            return (
                  <option key={type.value} value={type.value}>{type.label}</option>
            )
          })}
        </select>
  
      </div>  }
      
        </div>
      }
  
    
      <div ref={transferRef}>
        {isLoadingGroups ?<p className="text-center text-gray-600 text-lg font-medium my-4 animate-pulse">
    Loading...
</p>
 : 
         <CustomTransfer
         className="z-40 bg-white"
         options={availableOptions}
         availableSubOptions = {availableSubOptions}
         selected={analyticsDimensions?.dx}
         onChange={({ selected }) => handleChange(selected)}
         loading={loading || isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading || isSearching }
         onEndReached={handleEndReached}
       />
        }
       
      </div>
      {
        !isDataModalBeingUsedInMap 
        &&
        <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          text={isFetchAnalyticsDataLoading ? "Loading..." : "Update"}
          type="button"
          icon={<IoSaveOutline />}
          onClick={handleUpdate}
        />
      </div>
      }
     
    </div>
  );
};

export default DataModal;