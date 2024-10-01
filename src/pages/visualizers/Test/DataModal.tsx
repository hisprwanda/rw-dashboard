import React, { useState } from 'react'
import { Transfer, TransferOption } from "@dhis2/ui"
import Button from "../../../components/Button"
import { IoSaveOutline } from 'react-icons/io5'

interface DataModalProps {}

const DataModal: React.FC<DataModalProps> = () => {
    // Hardcoded dummy data for transfer options
    const [availableOptions, setAvailableOptions] = useState<TransferOption[]>([
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' },
        { label: 'Option 4', value: '4' }
    ])

    // Selected data state
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    // Function to handle the transfer of options between available and selected lists
    const handleChange = (newSelected: string[]) => {
        setSelectedOptions(newSelected)
    }

   /// handle update
    const handleUpdate = () => {
        console.log('Update data with selected options:', selectedOptions)
    }

   //// main return
    return (
        <div>
            <h3>Data</h3>
            <Transfer
                filterPlaceholder="Search options..."  // Placeholder for the filter
                options={availableOptions}             // List of available options
                selected={selectedOptions}             // Currently selected options
                onChange={({ selected }) => handleChange(selected)}  
            />
            <div className="mt-4 flex justify-end ">
                <Button variant="primary" text="Update" type="button" icon={<IoSaveOutline />} onClick={handleUpdate}  />
            </div>
        </div>
    )
}

export default DataModal
