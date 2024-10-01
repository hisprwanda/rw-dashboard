import React, { useState, useEffect } from 'react'
import { Transfer, TransferOption } from "@dhis2/ui"
import Button from "../../../../components/Button"
import { IoSaveOutline } from 'react-icons/io5'
import { useDataItems } from '../../../../services/fetchDataItems'

interface DataModalProps {}

const DataModal: React.FC<DataModalProps> = () => {
    // Fetch data using your custom hook
    const { data, error, loading, refetch } = useDataItems()

    // Initialize state for available options and selected options
    const [availableOptions, setAvailableOptions] = useState<TransferOption[]>([])
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    // Effect to map fetched data into the required TransferOption format
    useEffect(() => {
        if (data?.dataItems?.dataItems) {
            const transformedOptions = data.dataItems.dataItems.map((item: any) => ({
                label: item.name,  // Display the 'name' field in the Transfer list
                value: item.id     // Use the 'id' field as the value
            }))
            setAvailableOptions(transformedOptions)
        }
    }, [data])

    // Function to handle the transfer of options between available and selected lists
    const handleChange = (newSelected: string[]) => {
        setSelectedOptions(newSelected)
    }

    // Function to handle the update logic
    const handleUpdate = () => {
        console.log('Update data with selected options:', selectedOptions)
        // Perform your update logic here using selectedOptions
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error loading data...</div>

    return (
        <div>
            <h3>Data</h3>
            <Transfer
                filterPlaceholder="Search options..."  
                options={availableOptions}            
                selected={selectedOptions}            
                onChange={({ selected }) => handleChange(selected)}  
            />
            <div className="mt-4 flex justify-end">
                <Button 
                    variant="primary" 
                    text="Update" 
                    type="button" 
                    icon={<IoSaveOutline />} 
                    onClick={handleUpdate}  
                />
            </div>
        </div>
    )
}

export default DataModal
