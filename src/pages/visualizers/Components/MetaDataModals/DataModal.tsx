import React, { useState, useEffect } from 'react';
import { Transfer, TransferOption } from "@dhis2/ui";
import Button from "../../../../components/Button";
import { IoSaveOutline } from 'react-icons/io5';
import { useDataItems } from '../../../../services/fetchDataItems';
import Loading from '../../../../components/Loading';
import { useAuthorities } from '../../../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../../../lib/formatAnalyticsDimensions';


interface DataModalProps {
    setIsShowDataModal: any;
    data:any;
    loading:boolean;
    error: any;
}

const DataModal: React.FC<DataModalProps> = ({ setIsShowDataModal,data,error,loading }) => {
    // Fetch data using your custom hook
    //const { data, error, loading } = useDataItems();
    const { analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, isFetchAnalyticsDataLoading ,selectedDataSourceDetails} = useAuthorities();

    // Initialize state for available options and selected options
    const [availableOptions, setAvailableOptions] = useState<TransferOption[]>([]);

    // Effect to map fetched data into the required TransferOption format
    useEffect(() => {
        if (data?.dataItems) {
            const transformedOptions = data?.dataItems?.map((item: any) => ({
                label: item.name,  // Display the 'name' field in the Transfer list
                value: item.id     // Use the 'id' field as the value
            }));
            setAvailableOptions(transformedOptions);
        }
    }, [data]);

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
        await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions),selectedDataSourceDetails);
        setIsShowDataModal(false);
    };

    useEffect(() => {
        console.log("analyticsDimensions pp", analyticsDimensions);
    }, [analyticsDimensions]);

    // if (loading) return <Loading/>
    if (error) return <div>Error loading data...</div>;

    return (
        <div>
            <h3>Data</h3>
            <Transfer
                filterPlaceholder="Search options..."
                options={availableOptions}
                selected={analyticsDimensions?.dx}
                onChange={({ selected }) => handleChange(selected)}
                loading={loading}
                filterable
            />
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
