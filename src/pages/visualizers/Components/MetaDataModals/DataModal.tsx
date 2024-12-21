import React, { useState, useEffect } from 'react';
import { Transfer, TransferOption, SingleSelectField, SingleSelectOption, colors } from "@dhis2/ui";
import Button from "../../../../components/Button";
import { IoSaveOutline } from 'react-icons/io5';
import { useDataItems } from '../../../../services/fetchDataItems';
import Loading from '../../../../components/Loading';
import { useAuthorities } from '../../../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../../../lib/formatAnalyticsDimensions';
import { dimensionItemTypes } from '../../../../constants/dimensionItemTypes';
import { dimensionItemTypesTYPES } from "../../../../types/dimensionDataItemTypes";

interface DataModalProps {
    setIsShowDataModal: any;
    data: any;
    loading: boolean;
    error: any;
}

const DataModal: React.FC<DataModalProps> = ({ setIsShowDataModal, data, error, loading }) => {
    const { selectedDimensionItemType, setSelectedDimensionItemType } = useAuthorities();
    const { analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, isFetchAnalyticsDataLoading, selectedDataSourceDetails } = useAuthorities();

    // Initialize state for available options and selected options
    const [availableOptions, setAvailableOptions] = useState<TransferOption[]>([]);

    // Effect to map fetched data into the required TransferOption format
    useEffect(() => {
        if(['dataItems', 'Event Data Item', 'Program Indicator', 'Calculation'].includes(selectedDimensionItemType.value)) {
            if (data?.dataItems) {
                const transformedOptions = data?.dataItems?.map((item: any) => ({
                    label: item.name,  // Display the 'name' field in the Transfer list
                    value: item.id     // Use the 'id' field as the value
                }));
                setAvailableOptions(transformedOptions);
            }
        } else if (selectedDimensionItemType.value === "indicators") {
            if (data?.indicators) {
                const transformedOptions = data?.indicators?.map((item: any) => ({
                    label: item.name,  // Display the 'name' field in the Transfer list
                    value: item.id     // Use the 'id' field as the value
                }));
                setAvailableOptions(transformedOptions);
            } 
        } else if (selectedDimensionItemType.value === "dataElements") {
            if (data?.dataElements) {
                const transformedOptions = data?.dataElements?.map((item: any) => ({
                    label: item.name,  // Display the 'name' field in the Transfer list
                    value: item.id     // Use the 'id' field as the value
                }));
                setAvailableOptions(transformedOptions);
            } 
        } else if (selectedDimensionItemType.value === "dataSets") {
            if (data?.dataSets) {
                const transformedOptions = data?.dataSets?.map((item: any) => ({
                    label: item.name,  
                    value: item.id     
                }));
                setAvailableOptions(transformedOptions);
            } 
        }
    }, [data, selectedDimensionItemType]);

    // Handle the change of selected dimension item type
    const handleDimensionItemTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = dimensionItemTypes.find((type) => type.value === event.target.value);
        if (selectedType) {
            setSelectedDimensionItemType(selectedType);
        }
    };

    // Function to handle the transfer of options between available and selected lists
    const handleChange = (newSelected: string[]) => {
        setAnalyticsDimensions((prev: any) => {
            return {
                ...prev,
                dx: [...newSelected],
            };
        });
    };

    // Function to handle the update logic
    const handleUpdate = async () => {
        await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions), selectedDataSourceDetails);
        setIsShowDataModal(false);
    };


    useEffect(()=>{
        console.log("hello selected data",analyticsDimensions?.dx)
    },[analyticsDimensions])

    // if (loading) return <Loading />
    if (error) return <div>Error loading data...</div>;

    return (
        <div>
            <div className="space-y-2 mb-3">
                <label
                    htmlFor="dimensionItemType"
                    className="block text-sm font-medium text-gray-700"
                >
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

            {availableOptions.length > 0 ? (
                <Transfer
                    className="z-40 bg-white"
                    filterPlaceholder="Search options..."
                    options={availableOptions}
                    selected={analyticsDimensions?.dx}
                
                    onChange={({ selected }) => handleChange(selected)}
                    loading={loading}
                    filterable
                />
            ) : (
                <div className="text-gray-500 text-center">No Data Found</div>
            )}

            <div className="mt-4 flex justify-end">
                <Button
                    variant="primary"
                    text={isFetchAnalyticsDataLoading ? "Loading" : "Update"}
                    type="button"
                    icon={<IoSaveOutline />}
                    onClick={handleUpdate}
                />
            </div>
        </div>
    );
};

export default DataModal;
