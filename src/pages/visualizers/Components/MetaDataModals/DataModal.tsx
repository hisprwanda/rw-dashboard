import React, { useState, useEffect, useRef, useCallback } from "react";
import { Transfer, TransferOption } from "@dhis2/ui";
import Button from "../../../../components/Button";
import { IoSaveOutline } from "react-icons/io5";
import { useDataItems } from "../../../../services/fetchDataItems";
import { useAuthorities } from "../../../../context/AuthContext";
import { formatAnalyticsDimensions } from "../../../../lib/formatAnalyticsDimensions";
import { dimensionItemTypes } from "../../../../constants/dimensionItemTypes";
import { useExternalDataItems } from "../../../../services/useExternalDataItems";
import { debounce } from "lodash";

interface DataModalProps {
  setIsShowDataModal: (isShow: boolean) => void;
  data: any;
  loading: boolean;
  error: any;
}

const DataModal: React.FC<DataModalProps> = ({
  setIsShowDataModal,
  data,
  error,
  loading,
}) => {
  const [searchDataItem, setSearchDataItem] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
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
    isFetchAnalyticsDataLoading,
    selectedDataSourceDetails,
  } = useAuthorities();

  const [availableOptions, setAvailableOptions] = useState<TransferOption[]>([]);
  const transferRef = useRef<HTMLDivElement>(null);

  // Debounced handler for search
  const debouncedSearchHandler = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
      setDataItemsDataPage(1); // Reset pagination on new search
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDataItem(e.target.value);
    debouncedSearchHandler(e.target.value);
  };

  useEffect(() => {
    let transformedOptions: TransferOption[] = [];
    if (
      ["dataItems", "Event Data Item", "Program Indicator", "Calculation"].includes(
        selectedDimensionItemType.value
      )
    ) {
      transformedOptions =
        data?.dataItems?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];
    } else if (selectedDimensionItemType.value === "indicators") {
      transformedOptions =
        data?.indicators?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];
    } else if (selectedDimensionItemType.value === "dataElements") {
      transformedOptions =
        data?.dataElements?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];
    } else if (selectedDimensionItemType.value === "dataSets") {
      transformedOptions =
        data?.dataSets?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];
    }

    setAvailableOptions((prev) =>
      dataItemsDataPage > 1 ? [...prev, ...transformedOptions] : transformedOptions
    );
  }, [data, selectedDimensionItemType, dataItemsDataPage]);

  const handleDimensionItemTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = dimensionItemTypes.find((type) => type.value === event.target.value);
    if (selectedType) {
      setSelectedDimensionItemType(selectedType);
      setDataItemsDataPage(1); // Reset to page 1
    }
  };

  const handleChange = (newSelected: string[]) => {
    setAnalyticsDimensions((prev: any) => ({
      ...prev,
      dx: [...newSelected],
    }));
  };

  const handleUpdate = async () => {
    await fetchAnalyticsData(
      formatAnalyticsDimensions(analyticsDimensions),
      selectedDataSourceDetails
    );
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
      fetchCurrentInstanceData(selectedDimensionItemType, debouncedSearch, dataItemsDataPage);
    } else {
      fetchExternalDataItems(
        selectedDataSourceDetails.url,
        selectedDataSourceDetails.token,
        selectedDimensionItemType,
        debouncedSearch,
        dataItemsDataPage
      );
    }
  }, [selectedDimensionItemType, debouncedSearch, dataItemsDataPage]);


  useEffect(()=>{
    console.log("analyticsDimensions?.dx",analyticsDimensions?.dx)
    console.log("availableOptions",availableOptions)
  },[analyticsDimensions?.dx,availableOptions])

  if (error) return <div>Error loading data...</div>;

  return (
    <div>
      <div className="space-y-2 mb-3">
        <label htmlFor="dimensionItemType" className="block text-sm font-medium text-gray-700">
          Dimension Item Type
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
      <div ref={transferRef}>
        <Transfer
          className="z-40 bg-white"
          options={availableOptions}
          selected={analyticsDimensions?.dx}
          onChange={({ selected }) => handleChange(selected)}
          loading={loading || isFetchCurrentInstanceDataItemsLoading}
          onEndReached={handleEndReached}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          text={isFetchAnalyticsDataLoading ? "Loading..." : "Update"}
          type="button"
          icon={<IoSaveOutline />}
          onClick={handleUpdate}
        />
      </div>
    </div>
  );
};

export default DataModal;
