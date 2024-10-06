import React, { useState } from 'react';
import { Tab, Tabs, TabBar, SingleSelectField, SingleSelectOption, Transfer } from '@dhis2/ui';

const relativePeriods = {
    Months: [
        { label: 'This month', value: 'THIS_MONTH' },
        { label: 'Last month', value: 'LAST_MONTH' },
        { label: 'Last 3 months', value: 'LAST_3_MONTHS' },
        { label: 'Last 6 months', value: 'LAST_6_MONTHS' },
        { label: 'Months this year', value: 'MONTHS_THIS_YEAR' },
    ],
    Years: [
        { label: 'This year', value: 'THIS_YEAR' },
        { label: 'Last year', value: 'LAST_YEAR' },
        { label: 'Last 5 years', value: 'LAST_5_YEARS' },
    ]
};

const fixedPeriods = {
    2023: [
        { label: 'January 2023', value: '202301' },
        { label: 'February 2023', value: '202302' },
        { label: 'March 2023', value: '202303' },
    ],
    2024: [
        { label: 'January 2024', value: '202401' },
        { label: 'February 2024', value: '202402' },
        { label: 'March 2024', value: '202403' },
    ],
};

const PeriodModal = () => {
    const [selectedTab, setSelectedTab] = useState('relative');
    const [selectedPeriodType, setSelectedPeriodType] = useState('Months');
    const [selectedYear, setSelectedYear] = useState('2023');
    const [availablePeriods, setAvailablePeriods] = useState([]);
    const [selectedPeriods, setSelectedPeriods] = useState([]);

    // Handle switching between tabs
    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        if (tab === 'relative') {
            setAvailablePeriods(relativePeriods[selectedPeriodType] || []);
        } else {
            setAvailablePeriods(fixedPeriods[selectedYear] || []);
        }
    };

    // Handle changing the period type for relative periods
    const handlePeriodTypeChange = ({ selected }) => {
        setSelectedPeriodType(selected);
        setAvailablePeriods(relativePeriods[selected] || []);
    };

    // Handle changing the year for fixed periods
    const handleYearChange = ({ selected }) => {
        setSelectedYear(selected);
        setAvailablePeriods(fixedPeriods[selected] || []);
    };

    return (
        <div style={{ width: '600px', padding: '20px' }}>
            <TabBar>
                <Tab selected={selectedTab === 'relative'} onClick={() => handleTabChange('relative')}>
                    Relative periods
                </Tab>
                <Tab selected={selectedTab === 'fixed'} onClick={() => handleTabChange('fixed')}>
                    Fixed periods
                </Tab>
            </TabBar>

            {selectedTab === 'relative' && (
                <div>
                    <SingleSelectField
                        label="Period type"
                        selected={selectedPeriodType}
                        onChange={handlePeriodTypeChange}
                    >
                        <SingleSelectOption value="Days" label="Days" />
                        <SingleSelectOption value="Weeks" label="Weeks" />
                        <SingleSelectOption value="Months" label="Months" />
                        <SingleSelectOption value="Quarters" label="Quarters" />
                        <SingleSelectOption value="Years" label="Years" />
                    </SingleSelectField>
                </div>
            )}

            {selectedTab === 'fixed' && (
                <div>
                    <SingleSelectField
                        label="Year"
                        selected={selectedYear}
                        onChange={handleYearChange}
                    >
                        <SingleSelectOption value="2023" label="2023" />
                        <SingleSelectOption value="2024" label="2024" />
                    </SingleSelectField>
                </div>
            )}

            <Transfer
                options={availablePeriods}
                selected={selectedPeriods}
                onChange={({ selected }) => setSelectedPeriods(selected)}
                leftHeader="Available Periods"
                rightHeader="Selected Periods"
            />

            <div style={{ marginTop: '20px' }}>
                <button onClick={() => console.log(selectedPeriods)}>Update</button>
            </div>
        </div>
    );
};

export default PeriodModal;
