import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabBar, Transfer } from '@dhis2/ui';
import { useAuthorities } from '../../../../context/AuthContext';
import { formatAnalyticsDimensions } from '../../../../lib/formatAnalyticsDimensions';
import Button from '../../../../components/Button';
import { IoSaveOutline } from 'react-icons/io5';

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

interface PeriodPickerProps {
    setIsShowPeriod: any;
}

const PeriodPicker: React.FC<PeriodPickerProps> = ({ setIsShowPeriod }) => {
    const { analyticsDimensions, setAnalyticsDimensions, fetchAnalyticsData, isFetchAnalyticsDataLoading,setSelectedPeriods,selectedPeriods } = useAuthorities();
    const [selectedTab, setSelectedTab] = useState('relative');
    const [selectedPeriodType, setSelectedPeriodType] = useState('Months');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year by default
    const [availablePeriods, setAvailablePeriods] = useState([]);


    // Handle switching between tabs
    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        if (tab === 'relative') {
            setAvailablePeriods(relativePeriods[selectedPeriodType] || []);
        } else {
            setAvailablePeriods(generateMonthsForYear(selectedYear));
        }
    };

    // Dynamically generate months for the selected year
    const generateMonthsForYear = (year: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.map((month, index) => ({
            label: `${month} ${year}`,
            value: `${year}${(index + 1).toString().padStart(2, '0')}`, // Format: YYYYMM
        }));
    };

    // Handle changing the year for fixed periods
    const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newYear = parseInt(event.target.value);
        setSelectedYear(newYear);
        setAvailablePeriods(generateMonthsForYear(newYear));
    };

    // Handle selected period on change
    const handlePeriodSelect = ({ selected }) => {
        setSelectedPeriods(selected);

        setAnalyticsDimensions((prev: any) => {
            return {
                ...prev,
                pe: [...selected], // Update the pe array with selected periods
            };
        });
    };

    useEffect(() => {
        // Automatically set available periods based on the default tab (relative) when component loads
        if (selectedTab === 'relative') {
            setAvailablePeriods(relativePeriods[selectedPeriodType] || []);
        } else {
            setAvailablePeriods(generateMonthsForYear(selectedYear));
        }
    }, [selectedTab, selectedPeriodType, selectedYear]);

    // Handle update
    const handleUpdate = async () => {
        console.log('Update data with selected periods:', selectedPeriods);
        // Run analytics
        await fetchAnalyticsData(formatAnalyticsDimensions(analyticsDimensions));
        setIsShowPeriod(false);
    };

    // test 
    useEffect(()=>{
        console.log("selected periods is",selectedPeriods)
    },[selectedPeriods])

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
                    <label>Period type</label>
                    <select
                        value={selectedPeriodType}
                        onChange={(e) => setSelectedPeriodType(e.target.value)}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '10px', background: '#fff', zIndex: 1 }}
                    >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                        <option value="Quarters">Quarters</option>
                        <option value="Years">Years</option>
                    </select>
                </div>
            )}

            {selectedTab === 'fixed' && (
                <div>
                    <label>Year</label>
                    <input
                        type="number"
                        value={selectedYear}
                        onChange={handleYearChange}
                        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '10px', background: '#fff', zIndex: 1 }}
                    />
                </div>
            )}

            <Transfer
                options={availablePeriods}
                selected={selectedPeriods}
                onChange={handlePeriodSelect}
                leftHeader="Available Periods"
                rightHeader="Selected Periods"
            />

            <div className='flex justify-end mt-2'>
                <Button text={isFetchAnalyticsDataLoading ? 'Loading' : 'Update'} onClick={handleUpdate} variant='primary' type='button' icon={<IoSaveOutline />} />
            </div>
        </div>
    );
};

export default PeriodPicker;
